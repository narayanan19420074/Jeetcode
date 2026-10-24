import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { StoreItem } from '../../models/StoreItem.js';
import { StoreOrder } from '../../models/StoreOrder.js';
import { CoinTransaction } from '../../models/CoinTransaction.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logAdminAction } from '../../utils/adminAudit.js';
import { debitCoins, grantCoins } from '../../services/coin.service.js';
import { adminUpdateOrder, ensureStoreSeeded, loadCatalog, publicOrder } from '../../services/store.service.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/store/summary — numbers for the top of the Store page.
export const adminStoreSummary = asyncHandler(async (req, res) => {
  const [byStatus, coins, revenue] = await Promise.all([
    StoreOrder.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: null, circulating: { $sum: '$coins' }, earned: { $sum: '$coinsEarned' }, spent: { $sum: '$coinsSpent' } } }]),
    StoreOrder.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, coins: { $sum: '$total' }, orders: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s.n]));
  new ApiResponse(200, {
    orders: counts,
    toShip: (counts.placed || 0) + (counts.processing || 0),
    circulating: coins[0]?.circulating || 0,
    earned: coins[0]?.earned || 0,
    spent: coins[0]?.spent || 0,
    redeemedCoins: revenue[0]?.coins || 0,
    redeemedOrders: revenue[0]?.orders || 0,
  }).send(res);
});

// GET /api/admin/store/orders?status=&kind=&q=&page=&limit=
export const adminListOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, kind, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (kind) filter.kind = kind;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ handle: rx }, { email: rx }, { name: rx }] }).select('_id').limit(50).lean();
    filter.$or = [{ orderNo: rx }, { itemName: rx }, { user: { $in: users.map((u) => u._id) } }];
  }

  const [rows, total] = await Promise.all([
    StoreOrder.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name handle email').lean(),
    StoreOrder.countDocuments(filter),
  ]);

  const items = rows.map((o) => ({ ...publicOrder(o), user: o.user ? { id: o.user._id, name: o.user.name, handle: o.user.handle, email: o.user.email } : null }));
  new ApiResponse(200, { items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }).send(res);
});

// PATCH /api/admin/store/orders/:id — { status, carrier?, trackingNumber?, trackingUrl?, note? }
export const adminPatchOrder = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Order not found');
  const before = await StoreOrder.findById(req.params.id).select('status orderNo').lean();
  const order = await adminUpdateOrder(req.params.id, req.body);

  await logAdminAction(req, {
    action: 'store_order_update',
    targetType: 'StoreOrder',
    targetId: order._id,
    metadata: { orderNo: order.orderNo, from: before?.status, to: order.status, tracking: req.body.trackingNumber || undefined },
  });
  new ApiResponse(200, { order: publicOrder(order) }, `Order ${order.status}`).send(res);
});

// GET /api/admin/store/items — every catalog item with its live price/stock.
export const adminListItems = asyncHandler(async (req, res) => {
  const catalog = await loadCatalog();
  const items = [...catalog.values()].map((i) => ({
    slug: i.slug,
    name: i.name,
    category: i.category,
    kind: i.kind,
    defaultPrice: i.price,
    price: i.price,
    stock: i.stock,
    active: i.active,
    sold: i.sold,
  }));
  new ApiResponse(200, { items }).send(res);
});

// PATCH /api/admin/store/items/:slug — { price?, stock? (null = unlimited), active? }
export const adminPatchItem = asyncHandler(async (req, res) => {
  await ensureStoreSeeded();
  const set = {};
  if (req.body.price !== undefined) set.price = req.body.price;
  if (req.body.stock !== undefined) set.stock = req.body.stock;
  if (req.body.active !== undefined) set.active = req.body.active;

  const row = await StoreItem.findOneAndUpdate({ slug: req.params.slug }, { $set: set }, { new: true });
  if (!row) throw ApiError.notFound('Unknown item');

  await logAdminAction(req, { action: 'store_item_update', targetType: 'StoreItem', metadata: { slug: row.slug, ...set } });
  new ApiResponse(200, { slug: row.slug, price: row.price, stock: row.stock, active: row.active, sold: row.sold }, 'Item updated').send(res);
});

// POST /api/admin/store/coins — { handle, amount (+ grant / - take), note }
export const adminAdjustCoins = asyncHandler(async (req, res) => {
  const { handle, amount, note } = req.body;
  const user = await User.findOne({ handle }).select('_id handle name coins');
  if (!user) throw ApiError.notFound(`No user with handle @${handle}`);

  const stamp = `${req.user.id}:${Date.now()}`;
  let balance;
  if (amount > 0) {
    const res1 = await grantCoins(user._id, amount, { type: 'admin', reason: 'admin', title: `Bonus from JeetCode: ${note}`, key: `admin:${stamp}` });
    balance = res1.balance;
  } else {
    const res2 = await debitCoins(user._id, -amount, { type: 'admin', reason: 'admin', title: `Adjustment: ${note}`, key: `admin:${stamp}` });
    if (!res2) throw ApiError.badRequest(`@${handle} only has ${user.coins ?? 0} coins`);
    balance = res2.balance;
  }

  await logAdminAction(req, { action: 'coins_adjust', targetType: 'User', targetId: user._id, metadata: { handle, amount, note } });
  new ApiResponse(200, { handle, balance }, amount > 0 ? `Added ${amount} coins to @${handle}` : `Removed ${-amount} coins from @${handle}`).send(res);
});

// GET /api/admin/store/ledger?handle= — latest 50 ledger rows (optionally for one user).
export const adminLedger = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.handle) {
    const user = await User.findOne({ handle: String(req.query.handle).toLowerCase() }).select('_id').lean();
    if (!user) throw ApiError.notFound('User not found');
    filter.user = user._id;
  }
  const rows = await CoinTransaction.find(filter).sort({ createdAt: -1 }).limit(50).populate('user', 'handle').lean();
  new ApiResponse(200, {
    items: rows.map((t) => ({ id: t._id, handle: t.user?.handle || '—', amount: t.amount, type: t.type, reason: t.reason, title: t.title, at: t.createdAt })),
  }).send(res);
});
