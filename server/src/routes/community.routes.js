import { Router } from 'express';
import { requireAuth, attachUserIfPresent } from '../middlewares/auth.middleware.js';
import { checkProAccess } from '../middlewares/checkProAccess.middleware.js';
import { validate } from '../middlewares/validate.js';
import { communityWriteLimiter } from '../middlewares/rateLimiter.js';
import {
  listSolutionsQuerySchema,
  listThreadsQuerySchema,
  createSolutionSchema,
  updateSolutionSchema,
  createThreadSchema,
  updateThreadSchema,
  createCommentSchema,
  updateCommentSchema,
  voteSchema,
  reportSchema,
} from '../validators/community.validator.js';
import {
  listSolutions,
  listMyAccepted,
  createSolution,
  getSolution,
  updateSolution,
  deleteSolution,
  listThreads,
  createThread,
  getThread,
  updateThread,
  deleteThread,
  setTargetType,
  listComments,
  createComment,
  updateComment,
  deleteComment,
  castVote,
  createReport,
} from '../controllers/community.controller.js';

const router = Router();

// Reads: guests allowed (attachUserIfPresent), premium problems stay Pro-gated.
const read = [attachUserIfPresent, checkProAccess];
// Writes: login required + per-user rate limit.
const write = [requireAuth, communityWriteLimiter];

// Solutions
router.get('/problems/:slug/solutions', ...read, validate(listSolutionsQuerySchema, 'query'), listSolutions);
router.get('/problems/:slug/my-accepted', requireAuth, checkProAccess, listMyAccepted);
router.post('/problems/:slug/solutions', ...write, checkProAccess, validate(createSolutionSchema), createSolution);
router.get('/solutions/:id', ...read, getSolution);
router.patch('/solutions/:id', ...write, validate(updateSolutionSchema), updateSolution);
router.delete('/solutions/:id', ...write, deleteSolution);

// Discussion threads
router.get('/problems/:slug/threads', ...read, validate(listThreadsQuerySchema, 'query'), listThreads);
router.post('/problems/:slug/threads', ...write, checkProAccess, validate(createThreadSchema), createThread);
router.get('/threads/:id', ...read, getThread);
router.patch('/threads/:id', ...write, validate(updateThreadSchema), updateThread);
router.delete('/threads/:id', ...write, deleteThread);

// Comments (nested replies) — same handlers for solutions and threads.
router.get('/solutions/:id/comments', ...read, setTargetType('solution'), listComments);
router.get('/threads/:id/comments', ...read, setTargetType('thread'), listComments);
router.post('/solutions/:id/comments', ...write, checkProAccess, setTargetType('solution'), validate(createCommentSchema), createComment);
router.post('/threads/:id/comments', ...write, checkProAccess, setTargetType('thread'), validate(createCommentSchema), createComment);
router.patch('/comments/:id', ...write, validate(updateCommentSchema), updateComment);
router.delete('/comments/:id', ...write, deleteComment);

// Votes + reports
router.post('/votes', ...write, validate(voteSchema), castVote);
router.post('/reports', ...write, validate(reportSchema), createReport);

export default router;
