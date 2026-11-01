import { Router } from 'express';
import { requestHint, requestFix, requestLiveSession } from '../controllers/ai.controller.js';
import { validate } from '../middlewares/validate.js';
import { hintRequestSchema, fixRequestSchema, liveSessionRequestSchema } from '../validators/ai.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { aiHintLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// All AI endpoints bill per request, so they share one per-user limiter.
router.post('/hint', requireAuth, aiHintLimiter, validate(hintRequestSchema), requestHint);
router.post('/fix', requireAuth, aiHintLimiter, validate(fixRequestSchema), requestFix);
router.post('/live-session', requireAuth, aiHintLimiter, validate(liveSessionRequestSchema), requestLiveSession);

export default router;
