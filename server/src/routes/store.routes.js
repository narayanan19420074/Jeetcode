import { Router } from 'express';
import {
  getItems,
  getBalance,
  getWalletHandler,
  getTransactions,
  claimDailyHandler,
  purchase,
  getOrders,
  cancelMyOrder,
  getLastAddress,
  getMyCourses,
  getCourse,
  markLesson,
} from '../controllers/store.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { purchaseSchema, transactionsQuerySchema, lessonDoneSchema } from '../validators/store.validator.js';

// Mounted at /api/store in routes/index.js
const router = Router();

router.get('/items', attachUserIfPresent, getItems);
router.get('/courses/mine', requireAuth, getMyCourses); // before /courses/:slug
router.get('/courses/:slug', attachUserIfPresent, getCourse);
router.post('/courses/:slug/lessons/:key', requireAuth, validate(lessonDoneSchema), markLesson);

router.get('/balance', requireAuth, getBalance);
router.get('/wallet', requireAuth, getWalletHandler);
router.get('/transactions', requireAuth, validate(transactionsQuerySchema, 'query'), getTransactions);
router.post('/daily', requireAuth, claimDailyHandler);

router.post('/items/:slug/purchase', requireAuth, validate(purchaseSchema), purchase);
router.get('/orders', requireAuth, getOrders);
router.post('/orders/:id/cancel', requireAuth, cancelMyOrder);
router.get('/address', requireAuth, getLastAddress);

export default router;
