import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';
import { attachUserIfPresent } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { leaderboardQuerySchema } from '../validators/studyPlan.validator.js';

const router = Router();

// Public (guests can see the board); "me" / friends scope need a logged-in user.
router.get('/', attachUserIfPresent, validate(leaderboardQuerySchema, 'query'), getLeaderboard);

export default router;
