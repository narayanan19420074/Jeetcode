import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { PaymentOrder } from '../models/PaymentOrder.js';
import { createYoupiPayment, verifyYoupiSignature } from '../services/youpi.service.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// One-time passes (no auto-renew). Prices live HERE, server-side only.
const DAY_MS = 24 * 60 * 60 * 1000;
const PLAN_CONFIG = {
  monthly: { amountPaise: 14900, durationMs: 30 * DAY_MS },
  yearly: { amountPaise: 119900, durationMs: 365 * DAY_MS },
};

const publicBase = () => (env.APP_URL || env.RENDER_EXTERNAL_URL || env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');

// Activates Pro for a paid order. Safe to call many times: only the call that
// flips any-unpaid -> paid proceeds; every repeat returns early. A late SUCCESS
// (bank alert arriving after the gateway already sent FAILED/EXPIRED) still
// counts, because the money really arrived.
async function activateOrder(order, { paymentId, utr }) {
  const claimed = await PaymentOrder.findOneAndUpdate(
    { _id: order._id, status: { $in: ['created', 'failed', 'expired', 'cancelled'] } },
    { $set: { status: 'paid', gatewayPaymentId: paymentId || null, utr: utr || null, paidAt: new Date() } },
    { new: true }
  );
  if (!claimed) return false;

  const config = PLAN_CONFIG[claimed.plan];
  const user = await User.findById(claimed.userId).select('isPro proPlan proExpiresAt');
  if (!user) return true;

  // Lifetime (isPro with no expiry) is never downgraded to a timed pass.
  if (user.isPro && !user.proExpiresAt) return true;

  const now = new Date();
  const base = user.isPro && user.proExpiresAt && user.proExpiresAt > now ? user.proExpiresAt : now;
  await User.updateOne(
    { _id: user._id },
    { $set: { isPro: true, proPlan: claimed.plan, proExpiresAt: new Date(base.getTime() + config.durationMs) } }
  );
  return true;
}

// POST /api/billing/checkout — creates the order + YouPI payment, returns the
// hosted checkoutUrl. Nothing is granted until the signed webhook arrives.
export const createCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const config = PLAN_CONFIG[plan];

  const _id = new mongoose.Types.ObjectId();
  const orderId = `JC-${_id.toString()}`;

  const payment = await createYoupiPayment({
    orderId,
    amountPaise: config.amountPaise,
    returnUrl: `${publicBase()}/pricing?order=${orderId}`,
  });

  await PaymentOrder.create({
    _id,
    orderId,
    userId: req.user.id,
    plan,
    amountPaise: config.amountPaise,
    checkoutUrl: payment.checkoutUrl,
    gatewayPaymentId: payment.paymentId,
  });

  new ApiResponse(200, { orderId, checkoutUrl: payment.checkoutUrl, plan }).send(res);
});

// POST /api/billing/webhook — YouPI server-to-server. NOT behind requireAuth;
// trust = HMAC over the RAW body (mounted with express.raw in app.js).
export const handleWebhook = asyncHandler(async (req, res) => {
  const raw = req.body; // Buffer
  if (!verifyYoupiSignature(raw, req.headers['x-gateway-signature'])) {
    throw ApiError.badRequest('Invalid webhook signature');
  }

  const event = JSON.parse(raw.toString('utf8'));
  const order = event.orderId ? await PaymentOrder.findOne({ orderId: String(event.orderId) }) : null;

  // Unknown order: ack with 200 so the gateway stops retrying.
  if (!order) return res.status(200).json({ received: true });

  if (event.event === 'SUCCESS') {
    // Amount must match what WE priced. Never trust the gateway payload alone.
    if (Number(event.amountPaise) !== order.amountPaise) {
      console.error('YouPI webhook amount mismatch', { orderId: order.orderId, got: event.amountPaise, want: order.amountPaise });
      return res.status(200).json({ received: true });
    }
    await activateOrder(order, { paymentId: event.paymentId, utr: event.utr });
  } else if (['FAILED', 'EXPIRED', 'CANCELLED'].includes(event.event)) {
    await PaymentOrder.updateOne({ _id: order._id, status: 'created' }, { $set: { status: event.event.toLowerCase() } });
  }

  res.status(200).json({ received: true });
});

// GET /api/billing/order/:orderId — the /pricing return page polls this.
export const getOrderStatus = asyncHandler(async (req, res) => {
  const order = await PaymentOrder.findOne({ orderId: req.params.orderId, userId: req.user.id }).select('orderId status plan');
  if (!order) throw ApiError.notFound('Order not found');
  new ApiResponse(200, { orderId: order.orderId, status: order.status, plan: order.plan }).send(res);
});

// GET /api/billing/status
export const getStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('isPro proPlan proExpiresAt');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  new ApiResponse(200, {
    isPro: user.isPro,
    proPlan: user.proPlan,
    proExpiresAt: user.proExpiresAt,
  }).send(res);
});
