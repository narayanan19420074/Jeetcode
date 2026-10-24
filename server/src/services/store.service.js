import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { StoreItem } from '../models/StoreItem.js';
import { StoreOrder } from '../models/StoreOrder.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { QUEST_PRO_PLAN } from '../config/quests.js';
import {
  CATALOG,
  COIN_RULES,
  LOW_STOCK_AT,
  ORDER_TRANSITIONS,
  PHYSICAL_MIN_SOLVED,
  SHIP_COUNTRY,
  courseLessonKeys,
} from '../config/store.js';
import { ApiError } from '../utils/ApiError.js';
import { debitCoins, grantCoins } from './coin.service.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const utcDayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const utcMidnight = (d = new Date()) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

// ---------------------------------------------------------------- catalog

let seeding = null;

// Creates the mutable StoreItem row for any catalog item that has none yet.
// Never touches existing rows, so admin edits survive redeploys.
export function ensureStoreSeeded() {
  if (!seeding) {
    seeding = (async () => {
      const have = new Set((await StoreItem.find({}, 'slug').lean()).map((r) => r.slug));
      const missing = CATALOG.filter((i) => !have.has(i.slug)).map((i) => ({ slug: i.slug, price: i.price, stock: i.stock ?? null, active: true }));
      if (!missing.length) return;
      try {
        await StoreItem.insertMany(missing, { ordered: false });
      } catch (err) {
        // A parallel boot may have inserted the same rows; that is fine.
        if (err?.code !== 11000 && !err?.writeErrors?.length) throw err;
      }
    })().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

// slug -> static config merged with the live price / stock / active row.
export async function loadCatalog() {
  await ensureStoreSeeded();
  const rows = await StoreItem.find({}).lean();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const out = new Map();
  for (const cfg of CATALOG) {
    const row = bySlug.get(cfg.slug);
    out.set(cfg.slug, {
      ...cfg,
      price: row?.price ?? cfg.price,
      stock: row ? row.stock ?? null : cfg.stock ?? null,
      active: row ? row.active !== false : true,
      sold: row?.sold ?? 0,
    });
  }
  return out;
}

const totalSolved = (u) => (u?.easySolved ?? 0) + (u?.mediumSolved ?? 0) + (u?.hardSolved ?? 0);

function courseStats(item) {
  const keys = courseLessonKeys(item);
  const minutes = (item.modules || []).reduce((s, m) => s + m.lessons.reduce((a, l) => a + (l.minutes || 0), 0), 0);
  return { moduleCount: (item.modules || []).length, lessonCount: keys.length, minutes };
}

// What the client sees for one item. `ctx` carries the viewer's own state.
export function publicItem(item, ctx = {}) {
  const limited = item.stock !== null && item.stock !== undefined;
  const base = {
    slug: item.slug,
    name: item.name,
    category: item.category,
    kind: item.kind,
    price: item.price,
    blurb: item.blurb,
    desc: item.desc,
    art: item.art,
    image: item.image || null, // optional real photo URL, set in config/store.js
    accent: item.accent,
    popular: Boolean(item.popular),
    active: item.active,
    limited,
    stockLeft: limited ? item.stock : null,
    soldOut: limited && item.stock <= 0,
    lowStock: limited && item.stock > 0 && item.stock <= LOW_STOCK_AT,
    perUser: item.perUser ?? null,
    purchased: ctx.purchased?.[item.slug] ?? 0,
  };
  if (item.kind === 'pro') base.days = item.days;
  if (item.kind === 'physical') {
    base.sizes = item.sizes || [];
    base.colors = item.colors || [];
    base.minSolved = PHYSICAL_MIN_SOLVED;
    base.shipsTo = SHIP_COUNTRY;
  }
  if (item.kind === 'course') {
    base.level = item.level;
    Object.assign(base, courseStats(item));
    base.owned = Boolean(ctx.owned?.has(item.slug));
  }
  return base;
}

// Active items + the viewer's own context (owned courses, per-account purchase counts).
export async function listItems(userId) {
  const cat = await loadCatalog();
  const ctx = { owned: new Set(), purchased: {} };
  if (userId) {
    const [user, bought] = await Promise.all([
      User.findById(userId).select('ownedCourses').lean(),
      StoreOrder.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: { $ne: 'cancelled' } } },
        { $group: { _id: '$itemSlug', qty: { $sum: '$qty' } } },
      ]),
    ]);
    (user?.ownedCourses || []).forEach((c) => ctx.owned.add(c.slug));
    bought.forEach((b) => {
      ctx.purchased[b._id] = b.qty;
    });
  }
  return [...cat.values()].filter((i) => i.active).map((i) => publicItem(i, ctx));
}

// ---------------------------------------------------------------- pro helper

// Why Pro days cannot be added right now (null = fine). Same rules as quest rewards:
// paid plans are rewritten by the Razorpay webhook, so bonus days would vanish.
function proBlock(user, now = new Date()) {
  const active = Boolean(user?.isPro && (!user.proExpiresAt || user.proExpiresAt > now));
  if (!active) return null;
  if (!user.proExpiresAt) return 'lifetime';
  if (user.proPlan === 'monthly' || user.proPlan === 'yearly') return 'paid';
  return null;
}

// ---------------------------------------------------------------- orders

const makeOrderNo = () => `JC-${crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 8)}`;

export function publicOrder(o) {
  return {
    id: o._id,
    orderNo: o.orderNo,
    itemSlug: o.itemSlug,
    itemName: o.itemName,
    category: o.category,
    kind: o.kind,
    unitPrice: o.unitPrice,
    qty: o.qty,
    total: o.total,
    variant: o.variant || { size: '', color: '' },
    address: o.address || null,
    status: o.status,
    tracking: o.tracking || { carrier: '', number: '', url: '' },
    proUntil: o.proUntil || null,
    cancelReason: o.cancelReason || '',
    history: (o.history || []).map((h) => ({ status: h.status, note: h.note, by: h.by, at: h.at })),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

async function refundAndRestock({ userId, orderId, total, item, qty, restock, title }) {
  await grantCoins(userId, total, { type: 'refund', reason: 'refund', title, refId: String(orderId), key: `refund:${orderId}` });
  if (restock) {
    await StoreItem.updateOne({ slug: item.slug, stock: { $ne: null } }, { $inc: { stock: qty, sold: -qty } });
  }
}

export async function purchaseItem(userId, slug, { qty = 1, variant = {}, address = null } = {}) {
  const catalog = await loadCatalog();
  const item = catalog.get(slug);
  if (!item || !item.active) throw ApiError.notFound('This item is not available right now');

  const user = await User.findById(userId).select(
    'coins isPro proExpiresAt proPlan ownedCourses easySolved mediumSolved hardSolved'
  );
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const count = item.kind === 'physical' ? Math.max(1, Math.min(10, Math.floor(qty) || 1)) : 1;
  const now = new Date();

  // ---- eligibility, before any coin moves ----
  const cleanVariant = { size: '', color: '' };
  let cleanAddress = null;

  if (item.kind === 'physical') {
    if (totalSolved(user) < PHYSICAL_MIN_SOLVED) {
      throw ApiError.forbidden(`Solve at least ${PHYSICAL_MIN_SOLVED} problems to redeem merch (you have ${totalSolved(user)}).`);
    }
    if (item.sizes?.length) {
      if (!item.sizes.includes(variant.size)) throw ApiError.badRequest('Please choose a size');
      cleanVariant.size = variant.size;
    }
    if (item.colors?.length) {
      if (!item.colors.includes(variant.color)) throw ApiError.badRequest('Please choose a colour');
      cleanVariant.color = variant.color;
    }
    if (!address) throw ApiError.badRequest('A delivery address is required');
    cleanAddress = { ...address, country: SHIP_COUNTRY };

    if (item.perUser) {
      const [agg] = await StoreOrder.aggregate([
        { $match: { user: user._id, itemSlug: slug, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, qty: { $sum: '$qty' } } },
      ]);
      if ((agg?.qty ?? 0) + count > item.perUser) {
        throw ApiError.conflict(`Limit is ${item.perUser} per account for this item`);
      }
    }
  }

  if (item.kind === 'course' && user.ownedCourses.some((c) => c.slug === slug)) {
    throw ApiError.conflict('You already own this course');
  }

  if (item.kind === 'pro') {
    const block = proBlock(user, now);
    if (block === 'lifetime') throw ApiError.conflict('You already have lifetime Pro, so there is nothing to add.');
    if (block === 'paid') throw ApiError.conflict('Your paid Pro plan is active. Redeem this once it ends so no days are wasted.');
  }

  if (item.stock !== null && item.stock < count) throw ApiError.conflict(item.stock <= 0 ? 'Sold out' : `Only ${item.stock} left`);

  const total = item.price * count;
  if ((user.coins ?? 0) < total) throw ApiError.badRequest(`You need ${total - (user.coins ?? 0)} more coins for this`);

  // ---- 1) take the coins (atomic, cannot go negative) ----
  const orderId = new mongoose.Types.ObjectId();
  const debit = await debitCoins(userId, total, {
    reason: 'purchase',
    title: `Redeemed ${item.name}${count > 1 ? ` ×${count}` : ''}`,
    refId: String(orderId),
    key: `order:${orderId}`,
  });
  if (!debit) throw ApiError.badRequest('Not enough coins');

  const limited = item.stock !== null;
  const undo = (why) =>
    refundAndRestock({ userId, orderId, total, item, qty: count, restock: limited && stockTaken, title: `Refund · ${item.name} (${why})` });

  // ---- 2) reserve stock ----
  let stockTaken = false;
  try {
    if (limited) {
      const reserved = await StoreItem.findOneAndUpdate(
        { slug, stock: { $gte: count } },
        { $inc: { stock: -count, sold: count } },
        { new: true }
      );
      if (!reserved) {
        await undo('sold out');
        throw ApiError.conflict('Sold out. Your coins were returned.');
      }
      stockTaken = true;
    } else {
      await StoreItem.updateOne({ slug }, { $inc: { sold: count } });
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    await undo('error');
    throw err;
  }

  // ---- 3) create the order ----
  const digital = item.kind !== 'physical';
  let order;
  try {
    order = await StoreOrder.create({
      _id: orderId,
      orderNo: makeOrderNo(),
      user: userId,
      itemSlug: slug,
      itemName: item.name,
      category: item.category,
      kind: item.kind,
      unitPrice: item.price,
      qty: count,
      total,
      variant: cleanVariant,
      address: cleanAddress,
      status: digital ? 'fulfilled' : 'placed',
      history: [{ status: digital ? 'fulfilled' : 'placed', note: digital ? 'Delivered instantly' : 'Order placed', by: 'system' }],
    });
  } catch (err) {
    await undo('error');
    throw err;
  }

  // ---- 4) deliver digital goods ----
  if (item.kind === 'pro') {
    const active = Boolean(user.isPro && user.proExpiresAt && user.proExpiresAt > now);
    const base = active ? user.proExpiresAt : now;
    const proUntil = new Date(base.getTime() + item.days * DAY_MS);
    const applied = await User.findOneAndUpdate(
      { _id: userId, proExpiresAt: user.proExpiresAt ?? null }, // guards against a racing Pro change
      { $set: { isPro: true, proExpiresAt: proUntil, proPlan: active ? user.proPlan || QUEST_PRO_PLAN : QUEST_PRO_PLAN } },
      { new: true }
    );
    if (!applied) {
      await StoreOrder.updateOne({ _id: orderId }, { $set: { status: 'cancelled', cancelReason: 'Could not apply Pro days' } });
      await undo('could not apply');
      throw ApiError.conflict('Could not apply your Pro days, please try again. Your coins were returned.');
    }
    await StoreOrder.updateOne({ _id: orderId }, { $set: { proUntil } });
    order.proUntil = proUntil;
  }

  if (item.kind === 'course') {
    const pushed = await User.updateOne(
      { _id: userId, 'ownedCourses.slug': { $ne: slug } },
      { $push: { ownedCourses: { slug, at: now, done: [] } } }
    );
    if (!pushed.modifiedCount) {
      await StoreOrder.updateOne({ _id: orderId }, { $set: { status: 'cancelled', cancelReason: 'Course already owned' } });
      await undo('already owned');
      throw ApiError.conflict('You already own this course. Your coins were returned.');
    }
  }

  const fresh = await User.findById(userId);
  return { order: publicOrder(order), balance: debit.balance, user: fresh ? fresh.toPublicJSON() : null };
}

// Cancel + refund a physical order. by: 'user' (only while 'placed') | 'admin' (placed or processing).
export async function cancelOrder(orderId, { by, userId = null, note = '' }) {
  const filter = { _id: orderId, kind: 'physical', status: { $in: by === 'admin' ? ['placed', 'processing'] : ['placed'] } };
  if (userId) filter.user = userId;

  const order = await StoreOrder.findOneAndUpdate(
    filter,
    { $set: { status: 'cancelled', cancelReason: note }, $push: { history: { status: 'cancelled', note: note || (by === 'user' ? 'Cancelled by you' : 'Cancelled by JeetCode'), by } } },
    { new: true }
  );
  if (!order) throw ApiError.conflict('This order can no longer be cancelled');

  await refundAndRestock({
    userId: order.user,
    orderId: order._id,
    total: order.total,
    item: { slug: order.itemSlug },
    qty: order.qty,
    restock: true,
    title: `Refund · ${order.itemName}`,
  });
  return order;
}

// Admin: move a physical order along its lifecycle.
export async function adminUpdateOrder(orderId, { status, carrier = '', trackingNumber = '', trackingUrl = '', note = '' }) {
  const order = await StoreOrder.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.kind !== 'physical') throw ApiError.badRequest('Only merch orders can be updated');

  if (status === 'cancelled') return cancelOrder(orderId, { by: 'admin', note });

  if (!ORDER_TRANSITIONS[order.status]?.includes(status)) {
    throw ApiError.badRequest(`Cannot move an order from ${order.status} to ${status}`);
  }
  if (status === 'shipped' && !trackingNumber) throw ApiError.badRequest('Add a tracking number before marking it shipped');

  const set = { status };
  if (status === 'shipped') {
    set['tracking.carrier'] = carrier;
    set['tracking.number'] = trackingNumber;
    set['tracking.url'] = trackingUrl;
  }
  const updated = await StoreOrder.findOneAndUpdate(
    { _id: orderId, status: order.status },
    { $set: set, $push: { history: { status, note, by: 'admin' } } },
    { new: true }
  );
  if (!updated) throw ApiError.conflict('Order changed while you were editing it, reload and retry');
  return updated;
}

export async function lastAddress(userId) {
  const o = await StoreOrder.findOne({ user: userId, kind: 'physical', address: { $ne: null } }).sort({ createdAt: -1 }).select('address').lean();
  return o?.address || null;
}

// ---------------------------------------------------------------- wallet

export async function getWallet(userId) {
  const now = new Date();
  const user = await User.findById(userId).select('coins coinsEarned coinsSpent streakDays easySolved mediumSolved hardSolved');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const [solvedToday, claimedToday] = await Promise.all([
    Submission.exists({ user: user._id, mode: 'submit', status: 'Accepted', createdAt: { $gte: utcMidnight(now) } }),
    CoinTransaction.exists({ key: `${userId}:daily:${utcDayKey(now)}` }),
  ]);

  const streak = user.streakDays ?? 0;
  return {
    coins: user.coins ?? 0,
    earned: user.coinsEarned ?? 0,
    spent: user.coinsSpent ?? 0,
    streakDays: streak,
    totalSolved: totalSolved(user),
    minSolvedForMerch: PHYSICAL_MIN_SOLVED,
    daily: {
      claimed: Boolean(claimedToday),
      eligible: Boolean(solvedToday) && !claimedToday,
      solvedToday: Boolean(solvedToday),
      reward: dailyReward(streak + (solvedToday ? 0 : 1)),
    },
  };
}

function dailyReward(streak) {
  const bonus = Math.min(Math.max(streak, 0), COIN_RULES.dailyStreakBonusCap);
  const weekly = streak > 0 && streak % 7 === 0 ? COIN_RULES.weeklyStreakBonus : 0;
  return COIN_RULES.dailyBase + bonus + weekly;
}

export async function claimDaily(userId) {
  const now = new Date();
  const user = await User.findById(userId).select('streakDays');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const solvedToday = await Submission.exists({ user: user._id, mode: 'submit', status: 'Accepted', createdAt: { $gte: utcMidnight(now) } });
  if (!solvedToday) throw ApiError.badRequest('Solve at least one problem today to claim your check-in');

  const streak = user.streakDays ?? 0;
  const amount = dailyReward(streak);
  const res = await grantCoins(userId, amount, {
    reason: 'daily',
    title: `Daily check-in${streak > 0 ? ` · ${streak}-day streak` : ''}`,
    key: `daily:${utcDayKey(now)}`,
  });
  if (res.duplicate) throw ApiError.conflict('You already claimed today. Come back tomorrow!');
  if (!res.granted) throw ApiError.internal('Could not add your coins, please try again');
  return { amount, balance: res.balance };
}

// ---------------------------------------------------------------- courses

function courseProgress(item, owned) {
  const keys = courseLessonKeys(item);
  const done = new Set((owned?.done || []).filter((k) => keys.includes(k)));
  return { done: [...done], doneCount: done.size, lessonCount: keys.length, percent: keys.length ? Math.round((done.size / keys.length) * 100) : 0 };
}

export async function myCourses(userId) {
  const [catalog, user] = await Promise.all([loadCatalog(), User.findById(userId).select('ownedCourses').lean()]);
  return (user?.ownedCourses || [])
    .map((o) => {
      const item = catalog.get(o.slug);
      if (!item) return null;
      return { ...publicItem(item, { owned: new Set([o.slug]) }), purchasedAt: o.at, progress: courseProgress(item, o) };
    })
    .filter(Boolean);
}

// Syllabus is public; lesson links and progress are only for owners.
export async function courseDetail(userId, slug) {
  const catalog = await loadCatalog();
  const item = catalog.get(slug);
  if (!item || item.kind !== 'course') throw ApiError.notFound('Course not found');
  if (!item.active && !userId) throw ApiError.notFound('Course not found');

  let owned = null;
  if (userId) {
    const user = await User.findById(userId).select('ownedCourses').lean();
    owned = (user?.ownedCourses || []).find((c) => c.slug === slug) || null;
  }
  if (!item.active && !owned) throw ApiError.notFound('Course not found');

  const modules = item.modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      key: `${m.id}.${l.id}`,
      title: l.title,
      minutes: l.minutes,
      kind: l.kind,
      ...(owned ? { href: l.href } : {}),
    })),
  }));

  return {
    course: { ...publicItem(item, { owned: new Set(owned ? [slug] : []) }), modules },
    owned: Boolean(owned),
    progress: owned ? courseProgress(item, owned) : null,
  };
}

export async function setLessonDone(userId, slug, key, done) {
  const catalog = await loadCatalog();
  const item = catalog.get(slug);
  if (!item || item.kind !== 'course') throw ApiError.notFound('Course not found');
  if (!courseLessonKeys(item).includes(key)) throw ApiError.badRequest('Unknown lesson');

  const op = done ? { $addToSet: { 'ownedCourses.$.done': key } } : { $pull: { 'ownedCourses.$.done': key } };
  const user = await User.findOneAndUpdate({ _id: userId, 'ownedCourses.slug': slug }, op, { new: true }).select('ownedCourses').lean();
  if (!user) throw ApiError.forbidden('Buy this course to track your progress');
  const owned = user.ownedCourses.find((c) => c.slug === slug);
  return courseProgress(item, owned);
}
