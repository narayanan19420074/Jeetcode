import { Router } from 'express';
import {
  createCheckout,
  verifyPayment,
  handleWebhook,
  getStatus,
  cancelSubscription,
} from '../controllers/billing.controller.js';
import { validate } from '../middlewares/validate.js';
import { checkoutSchema, verifyPaymentSchema } from '../validators/billing.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// NOTE: /webhook is intentionally NOT here with requireAuth — Razorpay's
// server calls it directly, no user token involved. It also needs the
// raw body parser mounted ahead of it; that's done in app.js, not here.
// See WIRING_INSTRUCTIONS.md.
router.post('/webhook', handleWebhook);

router.post('/checkout', requireAuth, validate(checkoutSchema), createCheckout);
router.post('/verify', requireAuth, validate(verifyPaymentSchema), verifyPayment);
router.get('/status', requireAuth, getStatus);
router.post('/cancel', requireAuth, cancelSubscription);

export default router;
