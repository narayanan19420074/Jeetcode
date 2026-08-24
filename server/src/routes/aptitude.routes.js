import { Router } from 'express';
import {
  listPatterns,
  getPatternBySlug,
  getAttemptHistory,
  startAttempt,
  getAttemptQuestions,
  checkAnswer,
  submitAttempt,
  getAttempt,
} from '../controllers/aptitude.controller.js';
// NOTE: `attachUserIfPresent` is confirmed from problem.routes.js. I don't
// have the name of your "must be logged in" guard — guessed `requireAuth`.
// Swap for whatever auth.middleware.js actually exports.
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/patterns', attachUserIfPresent, listPatterns);
router.get('/patterns/:slug', requireAuth, getPatternBySlug);
router.get('/patterns/:slug/attempts', requireAuth, getAttemptHistory);
router.get('/attempts/:attemptId', requireAuth, getAttempt);

router.post('/patterns/:slug/start', requireAuth, startAttempt);
router.get('/attempts/:attemptId/questions', requireAuth, getAttemptQuestions);
router.post('/attempts/:attemptId/check', requireAuth, checkAnswer);
router.post('/attempts/:attemptId/submit', requireAuth, submitAttempt);

export default router;
