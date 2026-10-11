import { Router } from 'express';
import {
  listMyPlans,
  getToday,
  createPlan,
  getPlan,
  comparePlan,
  updatePlan,
  deletePlan,
  leavePlan,
  toggleItem,
  previewJoin,
  joinPlan,
} from '../controllers/studyPlan.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createPlanSchema, updatePlanSchema, toggleItemSchema, tzQuerySchema } from '../validators/studyPlan.validator.js';

const router = Router();
const tz = validate(tzQuerySchema, 'query');

router.use(requireAuth);

router.get('/', tz, listMyPlans);
router.post('/', validate(createPlanSchema), createPlan);
router.get('/today', tz, getToday);

// Static "join" paths must stay above "/:id" so they aren't read as an id.
router.get('/join/:code', previewJoin);
router.post('/join/:code', joinPlan);

router.get('/:id', tz, getPlan);
router.get('/:id/compare', tz, comparePlan);
router.patch('/:id', validate(updatePlanSchema), updatePlan);
router.delete('/:id', deletePlan);
router.post('/:id/leave', leavePlan);
router.post('/:id/items/:itemId/toggle', tz, validate(toggleItemSchema), toggleItem);

export default router;
