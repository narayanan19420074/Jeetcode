import { Router } from 'express';
import { requestHint } from '../controllers/ai.controller.js';
import { validate } from '../middlewares/validate.js';
import { hintRequestSchema } from '../validators/ai.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { aiHintLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/hint', requireAuth, aiHintLimiter, validate(hintRequestSchema), requestHint);

export default router;
