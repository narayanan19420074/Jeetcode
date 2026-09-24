import { Router } from 'express';
import {
  listPatterns,
  getPatternBySlug,
  getAttemptHistory,
  startAttempt,
  completeLearnSection,
  markSubsectionComplete,
  getAttemptQuestions,
  checkAnswer,
  submitAttempt,
  getAttempt,
} from '../controllers/aptitude.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/patterns', attachUserIfPresent, listPatterns);
router.get('/patterns/:slug', requireAuth, getPatternBySlug);
router.get('/patterns/:slug/attempts', requireAuth, getAttemptHistory);
router.get('/attempts/:attemptId', requireAuth, getAttempt);

router.post('/patterns/:slug/start', requireAuth, startAttempt);
router.post('/patterns/:slug/complete-learn', requireAuth, completeLearnSection);
router.post('/patterns/:slug/learn-progress', requireAuth, markSubsectionComplete);

router.get('/attempts/:attemptId/questions', requireAuth, getAttemptQuestions);
router.post('/attempts/:attemptId/check', requireAuth, checkAnswer);
router.post('/attempts/:attemptId/submit', requireAuth, submitAttempt);

export default router;