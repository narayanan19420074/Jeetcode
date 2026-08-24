import Razorpay from 'razorpay';
import { env } from '../config/env.js';

// Lazy singleton. The old version called `new Razorpay(...)` at module
// TOP LEVEL — which means simply *importing* this file threw if
// RAZORPAY_KEY_ID/SECRET weren't in .env yet, crashing the entire server
// on boot even for people who never touched a billing route.
//
// The Proxy defers actual construction until the first real property
// access (e.g. `razorpay.subscriptions.create(...)` inside a billing
// controller) — so the app boots fine with billing routes simply failing
// with a clear error if someone hits them before keys are configured,
// instead of the whole server refusing to start.
let _instance = null;

function getInstance() {
  if (_instance) return _instance;

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      'Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env before using any /api/billing route.'
    );
  }

  _instance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  return _instance;
}

// Same import/usage shape as before everywhere else in the codebase:
//   import { razorpay } from '../services/razorpay.service.js';
//   razorpay.subscriptions.create(...)
// — nothing in billing.controller.js needs to change.
export const razorpay = new Proxy(
  {},
  {
    get(_target, prop) {
      return getInstance()[prop];
    },
  }
);
