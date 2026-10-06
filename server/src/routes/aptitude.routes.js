import { Router } from 'express';
import {
  listPatterns,
  getPatternBySlug,
  getAttemptHistory,
  listPracticeQuestions,
  getPracticeQuestion,
  checkPracticeAnswer,
  bookmarkPracticeQuestion,
  startAttempt,
  completeLearnSection,
  markSubsectionComplete,
  getAttemptQuestions,
  saveAttemptProgress,
  checkAnswer,
  submitAttempt,
  getAttempt,
} from '../controllers/aptitude.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/patterns', attachUserIfPresent, listPatterns);
router.get('/patterns/:slug', requireAuth, getPatternBySlug);
router.get('/patterns/:slug/attempts', requireAuth, getAttemptHistory);

// Practice — LeetCode-style problem set (per-question status, filters, check)
router.get('/patterns/:slug/practice/questions', requireAuth, listPracticeQuestions);
router.get('/patterns/:slug/practice/questions/:questionId', requireAuth, getPracticeQuestion);
router.post('/patterns/:slug/practice/questions/:questionId/check', requireAuth, checkPracticeAnswer);
router.post('/patterns/:slug/practice/questions/:questionId/bookmark', requireAuth, bookmarkPracticeQuestion);

router.post('/patterns/:slug/start', requireAuth, startAttempt);
router.post('/patterns/:slug/complete-learn', requireAuth, completeLearnSection);
router.post('/patterns/:slug/learn-progress', requireAuth, markSubsectionComplete);

// Test — TCS iON style exam attempt
router.get('/attempts/:attemptId', requireAuth, getAttempt);
router.get('/attempts/:attemptId/questions', requireAuth, getAttemptQuestions);
router.post('/attempts/:attemptId/save', requireAuth, saveAttemptProgress);
router.post('/attempts/:attemptId/check', requireAuth, checkAnswer);
router.post('/attempts/:attemptId/submit', requireAuth, submitAttempt);

export default router;
