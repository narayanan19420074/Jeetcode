import crypto from 'crypto';
import { User } from '../models/User.js';
import { razorpay } from '../services/razorpay.service.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PLAN_CONFIG = {
  monthly: { planId: () => env.RAZORPAY_PLAN_ID_MONTHLY, totalCount: 120, durationMs: 30 * 24 * 60 * 60 * 1000 },
  yearly: { planId: () => env.RAZORPAY_PLAN_ID_YEARLY, totalCount: 10, durationMs: 365 * 24 * 60 * 60 * 1000 },
};

// POST /api/billing/checkout — creates (or reuses) a Razorpay customer for
// this user, then a Subscription in "created" state. Nothing is charged
// yet; the frontend opens Razorpay's Checkout.js with the returned
// subscriptionId, and the user completes payment there.
export const createCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const config = PLAN_CONFIG[plan];
  const planId = config.planId();
  if (!planId) throw ApiError.internal(`RAZORPAY_PLAN_ID_${plan.toUpperCase()} is not configured`);

  const user = await User.findById(req.user.id).select('+razorpayCustomerId name email');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  let customerId = user.razorpayCustomerId;
  if (!customerId) {
    const customer = await razorpay.customers.create({
      name: user.name,
      email: user.email,
      notes: { userId: user._id.toString() },
    });
    customerId = customer.id;
    user.razorpayCustomerId = customerId;
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: config.totalCount,
    notes: { userId: user._id.toString(), plan },
  });

  // Stored now (before payment completes) so a webhook that arrives before
  // the verify call still has something to match against. Doesn't grant
  // access — isPro stays false until activation.
  user.razorpaySubscriptionId = subscription.id;
  await user.save();

  new ApiResponse(200, {
    subscriptionId: subscription.id,
    keyId: env.RAZORPAY_KEY_ID,
    plan,
  }).send(res);
});

// POST /api/billing/verify — called by the frontend right after Razorpay
// Checkout's success callback. This is a UX optimization only (flips
// isPro immediately instead of the user waiting for the webhook), NOT the
// security boundary — the signature check here proves the payment
// belongs to this subscription, but the webhook below is the actual
// source of truth for the DB, since only Razorpay's server can call it
// and it can't be spoofed by a compromised client.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    throw ApiError.badRequest('Payment signature verification failed');
  }

  const user = await User.findOne({ _id: req.user.id, razorpaySubscriptionId: razorpay_subscription_id });
  if (!user) throw ApiError.badRequest('Subscription does not match this user');

  // Optimistic — the webhook will overwrite proPlan/proExpiresAt with the
  // exact values Razorpay's subscription entity carries, usually within
  // seconds. This just flips the flag so the UI doesn't wait.
  user.isPro = true;
  await user.save();

  new ApiResponse(200, { isPro: true }, 'Payment verified').send(res);
});

// POST /api/billing/webhook — Razorpay server-to-server event, NOT
// authenticated via requireAuth (Razorpay isn't a logged-in user). Trust
// comes entirely from the signature check below, computed over the RAW
// request body.
//
// IMPORTANT WIRING NOTE: this route needs the raw request body, not the
// parsed JSON your global `express.json()` middleware produces. Mount it
// with `express.raw({ type: 'application/json' })` as route-level
// middleware, and mount that BEFORE the global json() middleware applies
// to this path — see WIRING_INSTRUCTIONS.md.
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body) // raw Buffer — see routing note above
    .digest('hex');

  if (signature !== expected) {
    throw ApiError.badRequest('Invalid webhook signature');
  }

  const event = JSON.parse(req.body.toString('utf8'));
  const sub = event.payload?.subscription?.entity;

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      if (!sub) break;
      const plan = sub.notes?.plan === 'yearly' ? 'yearly' : 'monthly';
      await User.updateOne(
        { razorpaySubscriptionId: sub.id },
        {
          isPro: true,
          proPlan: plan,
          // Razorpay gives current_end in epoch seconds.
          proExpiresAt: sub.current_end ? new Date(sub.current_end * 1000) : null,
        }
      );
      break;
    }
    case 'subscription.cancelled': {
      // Intentionally NOT flipping isPro to false here. Cancellation is
      // set to take effect at the end of the current billing cycle (see
      // cancelSubscription below), and checkProAccess.middleware.js
      // already re-checks proExpiresAt on every gated request — so access
      // naturally lapses at the right time without extra state to track.
      break;
    }
    case 'payment.failed': {
      // Razorpay retries failed subscription charges on its own schedule
      // before eventually cancelling. Logging only for now — surfacing
      // this to the user (email/banner) is a follow-up, not blocking v1.
      console.warn('Razorpay payment.failed webhook', { subscriptionId: sub?.id });
      break;
    }
    default:
      break;
  }

  res.status(200).json({ received: true });
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

// POST /api/billing/cancel — cancels at the end of the current billing
// cycle rather than immediately, so the user keeps access they already
// paid for instead of losing it mid-cycle. Standard SaaS practice.
export const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+razorpaySubscriptionId');
  if (!user?.razorpaySubscriptionId) throw ApiError.badRequest('No active subscription found');

  await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, { cancel_at_cycle_end: 1 });

  new ApiResponse(
    200,
    { proExpiresAt: user.proExpiresAt },
    'Subscription cancelled — you keep Pro access until your current billing period ends'
  ).send(res);
});
