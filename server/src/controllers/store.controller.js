import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { StoreOrder } from '../models/StoreOrder.js';
import { EARN_WAYS, CATEGORIES, INDIAN_STATES, PHYSICAL_MIN_SOLVED, SHIP_COUNTRY } from '../config/store.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listTransactions } from '../services/coin.service.js';
import {
  cancelOrder,
  claimDaily,
  courseDetail,
  getWallet,
  lastAddress,
  listItems,
  myCourses,
  publicOrder,
  purchaseItem,
  setLessonDone,
} from '../services/store.service.js';

// GET /api/store/items — public; signed-in viewers also get owned/purchased flags.
export const getItems = asyncHandler(async (req, res) => {
  const items = await listItems(req.user?.id);
  new ApiResponse(200, {
    items,
    categories: CATEGORIES,
    states: INDIAN_STATES,
    shipsTo: SHIP_COUNTRY,
    minSolvedForMerch: PHYSICAL_MIN_SOLVED,
  }).send(res);
});

// GET /api/store/balance — tiny, polled by the navbar to keep the coin chip fresh.
export const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('coins').lean();
  if (!user) throw ApiError.unauthorized('User no longer exists');
  new ApiResponse(200, { coins: user.coins ?? 0 }).send(res);
});

// GET /api/store/wallet
export const getWalletHandler = asyncHandler(async (req, res) => {
  const wallet = await getWallet(req.user.id);
  new ApiResponse(200, { ...wallet, earnWays: EARN_WAYS }).send(res);
});

// GET /api/store/transactions?page=&limit=
export const getTransactions = asyncHandler(async (req, res) => {
  new ApiResponse(200, await listTransactions(req.user.id, req.query)).send(res);
});

// POST /api/store/daily
export const claimDailyHandler = asyncHandler(async (req, res) => {
  const result = await claimDaily(req.user.id);
  const wallet = await getWallet(req.user.id);
  new ApiResponse(200, { ...result, wallet }, `+${result.amount} coins`).send(res);
});

// POST /api/store/items/:slug/purchase
export const purchase = asyncHandler(async (req, res) => {
  const result = await purchaseItem(req.user.id, req.params.slug, req.body);
  new ApiResponse(201, result, 'Redeemed').send(res);
});

// GET /api/store/orders
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await StoreOrder.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  new ApiResponse(200, { items: orders.map(publicOrder) }).send(res);
});

// POST /api/store/orders/:id/cancel
export const cancelMyOrder = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Order not found');
  const order = await cancelOrder(req.params.id, { by: 'user', userId: req.user.id });
  const user = await User.findById(req.user.id);
  new ApiResponse(200, { order: publicOrder(order), user: user ? user.toPublicJSON() : null }, 'Order cancelled, coins refunded').send(res);
});

// GET /api/store/address — last delivery address, to prefill checkout.
export const getLastAddress = asyncHandler(async (req, res) => {
  new ApiResponse(200, { address: await lastAddress(req.user.id) }).send(res);
});

// GET /api/store/courses/mine
export const getMyCourses = asyncHandler(async (req, res) => {
  new ApiResponse(200, { items: await myCourses(req.user.id) }).send(res);
});

// GET /api/store/courses/:slug — syllabus is public, lesson links only for owners.
export const getCourse = asyncHandler(async (req, res) => {
  new ApiResponse(200, await courseDetail(req.user?.id, req.params.slug)).send(res);
});

// POST /api/store/courses/:slug/lessons/:key — body { done: boolean }
export const markLesson = asyncHandler(async (req, res) => {
  const progress = await setLessonDone(req.user.id, req.params.slug, req.params.key, req.body.done);
  new ApiResponse(200, { progress }).send(res);
});
