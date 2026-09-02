import { Router } from 'express';
import { getAdminStats, getRecentSignups, getAdminAuditLog } from '../../controllers/admin/admin.controller.js';
import {
  adminListProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  bulkDeleteProblem,
  restoreProblem,
  publishProblem,
} from '../../controllers/problem.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  createProblemSchema,
  updateProblemSchema,
  listProblemsQuerySchema,
  bulkDeleteProblemsSchema,
} from '../../validators/problem.validator.js';
import { requireAuth, requireRole, requireFreshRole } from '../../middlewares/auth.middleware.js';
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
} from '../../controllers/aptitude.controller.js';
import adminUsersRouter from './adminUsers.routes.js';
import adminLicensesRouter from './adminLicenses.routes.js';

const router = Router();

// Every route below requires an authenticated admin — enforced once here
// rather than repeated per-route.
router.use(requireAuth, requireRole('admin'));

// --- Overview ---
router.get('/stats', getAdminStats);
router.get('/signups', getRecentSignups);
router.get('/audit-log', getAdminAuditLog);

// --- Problems ---
router.get('/problems', validate(listProblemsQuerySchema, 'query'), adminListProblems);
router.post('/problems', validate(createProblemSchema), createProblem);
router.patch('/problems/:id', validate(updateProblemSchema), updateProblem);
router.patch('/problems/:id/publish', publishProblem);

// Destructive / undo actions re-verify the admin's role straight from the
// DB (requireFreshRole) on top of the router-wide requireRole check above.
router.delete('/problems/:id', requireFreshRole('admin'), deleteProblem);
router.post(
  '/problems/bulk-delete',
  requireFreshRole('admin'),
  validate(bulkDeleteProblemsSchema),
  bulkDeleteProblem
);
router.patch('/problems/:id/restore', requireFreshRole('admin'), restoreProblem);

// --- Aptitude ---
router.get('/aptitude/patterns', adminListPatterns);
router.post('/aptitude/patterns', createPattern);
router.patch('/aptitude/patterns/:id', updatePattern);
router.patch('/aptitude/patterns/:id/publish', publishPattern);
router.delete('/aptitude/patterns/:id', deletePattern);

router.get('/aptitude/questions', adminListQuestions); // ?patternId= to filter
router.post('/aptitude/questions', createQuestion);
router.patch('/aptitude/questions/:id', updateQuestion);
router.delete('/aptitude/questions/:id', deleteQuestion);

// --- Users & Licenses (each in their own sub-router, see ./adminUsers.routes.js
// and ./adminLicenses.routes.js) ---
router.use('/users', adminUsersRouter);
router.use('/licenses', adminLicensesRouter);

export default router;
