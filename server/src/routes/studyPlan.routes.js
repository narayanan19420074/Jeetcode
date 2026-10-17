import { Router } from 'express';
import {
  listMyPlans, createPlan, savePlan, getPlan, getFeed, postMessage, nudgeMember, removeMember,
  deletePlan, leavePlan, previewJoin, joinPlan, addFriendToPlan, listNotifications, markNotificationsRead,
} from '../controllers/studyPlan.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { savePlanSchema, messageSchema, tzQuerySchema, addMemberSchema } from '../validators/studyPlan.validator.js';

const router = Router();
const tz = validate(tzQuerySchema, 'query');

router.use(requireAuth);

router.get('/', tz, listMyPlans);
router.post('/', validate(savePlanSchema), createPlan);

// Static paths (notifications, join) must stay above "/:id" so they aren't read as an id.
router.get('/notifications', listNotifications);
router.post('/notifications/read', markNotificationsRead);

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
router.post('/:id/members', validate(addMemberSchema), addFriendToPlan);
router.delete('/:id/members/:userId', removeMember);

export default router;
