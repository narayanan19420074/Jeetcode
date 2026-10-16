import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { friendsLimiter } from '../middlewares/rateLimiter.js';
import { sendRequestSchema, searchQuerySchema } from '../validators/friend.validator.js';
import {
  listFriends,
  searchPlayers,
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  removeFriend,
  previewInvite,
  acceptInvite,
} from '../controllers/friend.controller.js';

const router = Router();
router.use(requireAuth, friendsLimiter);

router.get('/', listFriends);
router.get('/search', validate(searchQuerySchema, 'query'), searchPlayers);

router.post('/requests', validate(sendRequestSchema), sendRequest);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/decline', declineRequest);
router.delete('/requests/:id', cancelRequest);

router.get('/invite/:handle', previewInvite);
router.post('/invite/:handle', acceptInvite);

router.delete('/:userId', removeFriend);

export default router;
