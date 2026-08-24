import { Router } from 'express';
import {
  createSubmission,
  getSubmission,
  listMySubmissions,
} from '../controllers/submission.controller.js';
import { validate } from '../middlewares/validate.js';
import { createSubmissionSchema } from '../validators/submission.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { executionLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/', requireAuth, executionLimiter, validate(createSubmissionSchema), createSubmission);
router.get('/me', requireAuth, listMySubmissions);
router.get('/:id', requireAuth, getSubmission);

export default router;
