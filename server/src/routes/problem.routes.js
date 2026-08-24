import { Router } from 'express';
import {
  listProblems,
  getProblemBySlug,
} from '../controllers/problem.controller.js';
import { validate } from '../middlewares/validate.js';
import { listProblemsQuerySchema } from '../validators/problem.validator.js';
import { attachUserIfPresent } from '../middlewares/auth.middleware.js';
import { checkProAccess } from '../middlewares/checkProAccess.middleware.js';

const router = Router();

// attachUserIfPresent must run first — checkProAccess reads req.user.id,
// which only exists after that middleware runs (and stays undefined for
// guests, which checkProAccess already handles by short-circuiting).
router.get('/', attachUserIfPresent, checkProAccess, validate(listProblemsQuerySchema, 'query'), listProblems);
router.get('/:slug', attachUserIfPresent, checkProAccess, getProblemBySlug);

export default router;
