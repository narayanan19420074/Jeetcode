import { Router } from 'express';
import { createCheckout, handleWebhook, getStatus, getOrderStatus } from '../controllers/billing.controller.js';
import { validate } from '../middlewares/validate.js';
import { checkoutSchema } from '../validators/billing.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// NOTE: the real /webhook is mounted in app.js with express.raw() BEFORE
// express.json() (needs the raw bytes for the HMAC). This line is only a
// fallback and is never reached in normal operation.
router.post('/webhook', handleWebhook);

router.post('/checkout', requireAuth, validate(checkoutSchema), createCheckout);
router.get('/order/:orderId', requireAuth, getOrderStatus);
router.get('/status', requireAuth, getStatus);

export default router;
