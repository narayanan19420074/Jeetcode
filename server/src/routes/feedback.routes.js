import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { validate } from '../middlewares/validate.js';
import { submitFeedbackSchema } from '../validators/feedback.validator.js';
import { attachUserIfPresent } from '../middlewares/auth.middleware.js';
import { feedbackLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public: guests can contact support too. Admin read/update lives in routes/admin/admin.routes.js.
router.post('/', attachUserIfPresent, feedbackLimiter, validate(submitFeedbackSchema), submitFeedback);

export default router;
