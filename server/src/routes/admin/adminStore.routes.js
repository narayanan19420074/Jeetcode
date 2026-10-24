import { Router } from 'express';
import {
  adminStoreSummary,
  adminListOrders,
  adminPatchOrder,
  adminListItems,
  adminPatchItem,
  adminAdjustCoins,
  adminLedger,
} from '../../controllers/admin/adminStore.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  adminOrdersQuerySchema,
  adminOrderUpdateSchema,
  adminItemUpdateSchema,
  adminCoinsSchema,
} from '../../validators/store.validator.js';

// Mounted at /api/admin/store in admin.routes.js — requireAuth +
// requireRole('admin') already applied there via router.use().
const router = Router();

router.get('/summary', adminStoreSummary);
router.get('/orders', validate(adminOrdersQuerySchema, 'query'), adminListOrders);
router.patch('/orders/:id', validate(adminOrderUpdateSchema), adminPatchOrder);
router.get('/items', adminListItems);
router.patch('/items/:slug', validate(adminItemUpdateSchema), adminPatchItem);
router.post('/coins', validate(adminCoinsSchema), adminAdjustCoins);
router.get('/ledger', adminLedger);

export default router;
