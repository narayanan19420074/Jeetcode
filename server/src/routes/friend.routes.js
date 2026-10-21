import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { friendsLimiter } from '../middlewares/rateLimiter.js';
import { sendRequestSchema, searchQuerySchema, sendMessageSchema, roomInviteSchema } from '../validators/friend.validator.js';
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
import {
  getUnread,
  getHistory,
  postMessage,
  readChat,
  nudgeFriend,
  inviteToRoom,
  compareWithFriend,
  activityFeed,
} from '../controllers/friendSocial.controller.js';

const router = Router();
router.use(requireAuth, friendsLimiter);

router.get('/', listFriends);
router.get('/search', validate(searchQuerySchema, 'query'), searchPlayers);

router.post('/requests', validate(sendRequestSchema), sendRequest);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/decline', declineRequest);
router.delete('/requests/:id', cancelRequest);

// Activity feed + chat. Declared before the /:userId routes so 'activity' / 'chat' are never read as ids.
router.get('/activity', activityFeed);
router.get('/chat/unread', getUnread);
router.get('/chat/:userId', getHistory);
router.post('/chat/:userId', validate(sendMessageSchema), postMessage);
router.post('/chat/:userId/read', readChat);

// Per-friend actions
router.post('/:userId/nudge', nudgeFriend);
router.post('/:userId/room', validate(roomInviteSchema), inviteToRoom);
router.get('/:userId/compare', compareWithFriend);

router.get('/invite/:handle', previewInvite);
router.post('/invite/:handle', acceptInvite);

router.delete('/:userId', removeFriend);

export default router;
