import { Router } from 'express';
import { getAdminStats, getRecentSignups } from '../controllers/admin.controller.js';
import {
  adminListProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  publishProblem,
} from '../controllers/problem.controller.js';
import { validate } from '../middlewares/validate.js';
import { createProblemSchema, updateProblemSchema, listProblemsQuerySchema } from '../validators/problem.validator.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import {
  adminListPatterns,
  createPattern,
  updatePattern,
  deletePattern,
  publishPattern,
  adminListQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/aptitude.controller.js';

const router = Router();

// Every route below requires an authenticated admin — enforced once here
// rather than repeated per-route.
router.use(requireAuth, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/signups', getRecentSignups);

router.get('/problems', validate(listProblemsQuerySchema, 'query'), adminListProblems);
router.post('/problems', validate(createProblemSchema), createProblem);
router.patch('/problems/:id', validate(updateProblemSchema), updateProblem);
router.patch('/problems/:id/publish', publishProblem);
router.delete('/problems/:id', deleteProblem);
router.get('/aptitude/patterns', adminListPatterns);
router.post('/aptitude/patterns', createPattern);
router.patch('/aptitude/patterns/:id', updatePattern);
router.patch('/aptitude/patterns/:id/publish', publishPattern);
router.delete('/aptitude/patterns/:id', deletePattern);

router.get('/aptitude/questions', adminListQuestions); // ?patternId= to filter
router.post('/aptitude/questions', createQuestion);
router.patch('/aptitude/questions/:id', updateQuestion);
router.delete('/aptitude/questions/:id', deleteQuestion);

export default router;
