import { Router } from 'express';
import { getContest, applyToContest, withdrawFromContest } from '../controllers/contest.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { applySchema } from '../validators/contest.validator.js';

const router = Router();

// Public: guests can read the page and see the applicant count.
router.get('/current', attachUserIfPresent, getContest);
router.post('/current/apply', requireAuth, validate(applySchema), applyToContest);
router.delete('/current/apply', requireAuth, withdrawFromContest);

export default router;
