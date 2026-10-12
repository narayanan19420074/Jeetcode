import { Router } from 'express';
import {
  listMyPlans, createPlan, savePlan, getPlan, getFeed, postMessage, nudgeMember, removeMember,
  deletePlan, leavePlan, previewJoin, joinPlan,
} from '../controllers/studyPlan.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { savePlanSchema, messageSchema, tzQuerySchema } from '../validators/studyPlan.validator.js';

const router = Router();
const tz = validate(tzQuerySchema, 'query');

router.use(requireAuth);

router.get('/', tz, listMyPlans);
router.post('/', validate(savePlanSchema), createPlan);

// Static "join" paths must stay above "/:id" so they aren't read as an id.
router.get('/join/:code', previewJoin);
router.post('/join/:code', joinPlan);

router.get('/:id', tz, getPlan);
router.put('/:id', validate(savePlanSchema), savePlan);
router.delete('/:id', deletePlan);
router.post('/:id/leave', leavePlan);

router.get('/:id/feed', getFeed);
router.post('/:id/messages', validate(messageSchema), postMessage);
router.post('/:id/nudge/:userId', tz, nudgeMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
