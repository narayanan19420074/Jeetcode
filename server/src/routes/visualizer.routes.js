import { Router } from 'express';
import { createTrace } from '../controllers/visualizer.controller.js';
import { validate } from '../middlewares/validate.js';
import { traceRequestSchema } from '../validators/visualizer.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { executionLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Tracing runs code like Run does, so it shares the execution rate limit.
router.post('/trace', requireAuth, executionLimiter, validate(traceRequestSchema), createTrace);

export default router;
