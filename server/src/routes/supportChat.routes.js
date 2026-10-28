import { Router } from 'express';
import { getMyChat, getMyUnread, sendMyMessage, closeMyChat } from '../controllers/supportChat.controller.js';
import { validate } from '../middlewares/validate.js';
import { sendChatMessageSchema, chatPollQuerySchema } from '../validators/supportChat.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { supportChatLimiter } from '../middlewares/rateLimiter.js';

const router = Router();
router.use(requireAuth);

// Admin-side chat routes live in routes/admin/admin.routes.js.
router.get('/chat', validate(chatPollQuerySchema, 'query'), getMyChat);
router.get('/chat/unread', getMyUnread);
router.post('/chat/messages', supportChatLimiter, validate(sendChatMessageSchema), sendMyMessage);
router.post('/chat/close', closeMyChat);

export default router;
