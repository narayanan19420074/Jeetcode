import { Solution } from '../models/Solution.js';
import { Thread } from '../models/Thread.js';
import { Comment } from '../models/Comment.js';
import { Vote } from '../models/Vote.js';
import { Report } from '../models/Report.js';
import { Submission } from '../models/Submission.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  AUTHOR_FIELDS,
  MAX_COMMENT_DEPTH,
  getAccessibleProblem,
  assertProblemIdAccess,
  loadTarget,
  makeExcerpt,
  makeCodePreview,
  isOwner,
  decorate,
  applyVote,
  cascadeDelete,
  toObjectId,
} from '../services/community.service.js';

const pagination = (page, limit, total) => ({ page, limit, total, totalPages: Math.ceil(total / limit) });
const canModify = (doc, user) => isOwner(doc, user) || user.role === 'admin';
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------- Solutions

// GET /community/problems/:slug/solutions
export const listSolutions = asyncHandler(async (req, res) => {
  const problem = await getAccessibleProblem(req.params.slug, req);
  const { sort, language, page, limit } = req.query;

  const filter = { problem: problem._id, ...(language ? { language } : {}) };
  const sortSpec = sort === 'new' ? { createdAt: -1 } : { score: -1, createdAt: -1 };

  const [rows, total] = await Promise.all([
    Solution.find(filter)
      .select('-code -content')
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS)
      .lean(),
    Solution.countDocuments(filter),
  ]);

  const items = await decorate(rows, 'solution', req.user);
  new ApiResponse(200, { items, pagination: pagination(page, limit, total) }).send(res);
});

// GET /community/problems/:slug/my-accepted — Accepted submissions the user can share.
export const listMyAccepted = asyncHandler(async (req, res) => {
  const problem = await getAccessibleProblem(req.params.slug, req);
  const subs = await Submission.find({
    user: req.user.id,
    problem: problem._id,
    mode: 'submit',
    status: 'Accepted',
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('language code runtimeMs memoryKb createdAt')
    .lean();

  const shared = await Solution.find({ submission: { $in: subs.map((s) => s._id) } })
    .select('submission')
    .lean();
  const sharedSet = new Set(shared.map((s) => String(s.submission)));

  new ApiResponse(
    200,
    subs.map((s) => ({ ...s, alreadyShared: sharedSet.has(String(s._id)) }))
  ).send(res);
});

// POST /community/problems/:slug/solutions
export const createSolution = asyncHandler(async (req, res) => {
  const problem = await getAccessibleProblem(req.params.slug, req);
  const { submissionId, title, content } = req.body;

  const sub = await Submission.findById(submissionId).lean();
  if (!sub || String(sub.user) !== req.user.id || String(sub.problem) !== String(problem._id)) {
    throw ApiError.notFound('Submission not found');
  }
  if (sub.mode !== 'submit' || sub.status !== 'Accepted') {
    throw ApiError.badRequest('Only Accepted submissions can be shared');
  }

  let solution;
  try {
    solution = await Solution.create({
      problem: problem._id,
      author: req.user.id,
      submission: sub._id,
      title,
      content,
      excerpt: makeExcerpt(content),
      language: sub.language,
      code: sub.code,
      codePreview: makeCodePreview(sub.code),
      runtimeMs: sub.runtimeMs,
      memoryKb: sub.memoryKb,
    });
  } catch (err) {
    if (err?.code === 11000) throw ApiError.conflict('You already shared this submission');
    throw err;
  }

  const populated = await Solution.findById(solution._id).select('-code -content').populate('author', AUTHOR_FIELDS).lean();
  const [item] = await decorate([populated], 'solution', req.user);
  new ApiResponse(201, item, 'Solution shared').send(res);
});

// GET /community/solutions/:id — full detail incl. code + markdown.
export const getSolution = asyncHandler(async (req, res) => {
  toObjectId(req.params.id, 'Solution');
  const solution = await Solution.findById(req.params.id).populate('author', AUTHOR_FIELDS).lean();
  if (!solution) throw ApiError.notFound('Solution not found');
  await assertProblemIdAccess(solution.problem, req);
  const [item] = await decorate([solution], 'solution', req.user);
  new ApiResponse(200, item).send(res);
});

// PATCH /community/solutions/:id — owner edits title / write-up (code is fixed).
export const updateSolution = asyncHandler(async (req, res) => {
  const solution = await loadTarget('solution', req.params.id);
  if (!isOwner(solution, req.user)) throw ApiError.forbidden();
  solution.title = req.body.title;
  solution.content = req.body.content;
  solution.excerpt = makeExcerpt(req.body.content);
  solution.editedAt = new Date();
  await solution.save();
  new ApiResponse(200, { _id: solution._id, title: solution.title, content: solution.content, excerpt: solution.excerpt, editedAt: solution.editedAt }).send(res);
});

// DELETE /community/solutions/:id
export const deleteSolution = asyncHandler(async (req, res) => {
  const solution = await loadTarget('solution', req.params.id);
  if (!canModify(solution, req.user)) throw ApiError.forbidden();
  await cascadeDelete('solution', solution);
  new ApiResponse(200, { deleted: true }).send(res);
});

// ------------------------------------------------------------------ Threads

// GET /community/problems/:slug/threads
export const listThreads = asyncHandler(async (req, res) => {
  const problem = await getAccessibleProblem(req.params.slug, req);
  const { sort, q, page, limit } = req.query;

  const filter = { problem: problem._id };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { body: rx }];
  }
  const sortSpec =
    sort === 'new' ? { createdAt: -1 } : sort === 'top' ? { score: -1, createdAt: -1 } : { lastActivityAt: -1 };

  const [rows, total] = await Promise.all([
    Thread.find(filter)
      .select('-body')
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS)
      .lean(),
    Thread.countDocuments(filter),
  ]);

  const items = await decorate(rows, 'thread', req.user);
  new ApiResponse(200, { items, pagination: pagination(page, limit, total) }).send(res);
});

// POST /community/problems/:slug/threads
export const createThread = asyncHandler(async (req, res) => {
  const problem = await getAccessibleProblem(req.params.slug, req);
  const { title, body } = req.body;
  const thread = await Thread.create({
    problem: problem._id,
    author: req.user.id,
    title,
    body,
    excerpt: makeExcerpt(body),
  });
  const populated = await Thread.findById(thread._id).select('-body').populate('author', AUTHOR_FIELDS).lean();
  const [item] = await decorate([populated], 'thread', req.user);
  new ApiResponse(201, item, 'Thread created').send(res);
});

// GET /community/threads/:id
export const getThread = asyncHandler(async (req, res) => {
  toObjectId(req.params.id, 'Thread');
  const thread = await Thread.findById(req.params.id).populate('author', AUTHOR_FIELDS).lean();
  if (!thread) throw ApiError.notFound('Thread not found');
  await assertProblemIdAccess(thread.problem, req);
  const [item] = await decorate([thread], 'thread', req.user);
  new ApiResponse(200, item).send(res);
});

// PATCH /community/threads/:id
export const updateThread = asyncHandler(async (req, res) => {
  const thread = await loadTarget('thread', req.params.id);
  if (!isOwner(thread, req.user)) throw ApiError.forbidden();
  thread.title = req.body.title;
  thread.body = req.body.body;
  thread.excerpt = makeExcerpt(req.body.body);
  thread.editedAt = new Date();
  await thread.save();
  new ApiResponse(200, { _id: thread._id, title: thread.title, body: thread.body, excerpt: thread.excerpt, editedAt: thread.editedAt }).send(res);
});

// DELETE /community/threads/:id
export const deleteThread = asyncHandler(async (req, res) => {
  const thread = await loadTarget('thread', req.params.id);
  if (!canModify(thread, req.user)) throw ApiError.forbidden();
  await cascadeDelete('thread', thread);
  new ApiResponse(200, { deleted: true }).send(res);
});

// ----------------------------------------------------------------- Comments

// Route-level helper: tells the shared comment handlers which parent type
// the URL referred to (/solutions/:id/comments vs /threads/:id/comments).
export const setTargetType = (targetType) => (req, res, next) => {
  req.targetType = targetType;
  next();
};

// GET /community/(solutions|threads)/:id/comments — flat list; client builds the tree.
export const listComments = asyncHandler(async (req, res) => {
  const target = await loadTarget(req.targetType, req.params.id);
  await assertProblemIdAccess(target.problem, req);

  const rows = await Comment.find({ targetType: req.targetType, target: target._id })
    .sort({ createdAt: 1 })
    .limit(500)
    .populate('author', AUTHOR_FIELDS)
    .lean();

  const items = await decorate(rows, 'comment', req.user);
  new ApiResponse(200, items).send(res);
});

// POST /community/(solutions|threads)/:id/comments
export const createComment = asyncHandler(async (req, res) => {
  const target = await loadTarget(req.targetType, req.params.id);
  await assertProblemIdAccess(target.problem, req);

  let depth = 0;
  let parent = null;
  if (req.body.parentId) {
    parent = await Comment.findById(req.body.parentId).lean();
    if (!parent || parent.targetType !== req.targetType || String(parent.target) !== String(target._id)) {
      throw ApiError.notFound('Parent comment not found');
    }
    if (parent.isDeleted) throw ApiError.badRequest('You cannot reply to a deleted comment');
    depth = parent.depth + 1;
    if (depth > MAX_COMMENT_DEPTH) throw ApiError.badRequest('Reply depth limit reached');
  }

  const comment = await Comment.create({
    targetType: req.targetType,
    target: target._id,
    parent: parent?._id ?? null,
    depth,
    author: req.user.id,
    body: req.body.body,
  });

  target.commentCount += 1;
  if (req.targetType === 'thread') target.lastActivityAt = new Date();
  await target.save();

  const populated = await Comment.findById(comment._id).populate('author', AUTHOR_FIELDS).lean();
  const [item] = await decorate([populated], 'comment', req.user);
  new ApiResponse(201, item).send(res);
});

// PATCH /community/comments/:id
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await loadTarget('comment', req.params.id);
  if (!isOwner(comment, req.user)) throw ApiError.forbidden();
  if (comment.isDeleted) throw ApiError.badRequest('Comment was deleted');
  comment.body = req.body.body;
  comment.editedAt = new Date();
  await comment.save();
  new ApiResponse(200, { _id: comment._id, body: comment.body, editedAt: comment.editedAt }).send(res);
});

// DELETE /community/comments/:id — soft delete if it has replies, else hard delete.
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await loadTarget('comment', req.params.id);
  if (!canModify(comment, req.user)) throw ApiError.forbidden();
  if (comment.isDeleted) return new ApiResponse(200, { deleted: true, soft: true }).send(res);

  const hasReplies = await Comment.exists({ parent: comment._id });
  await Vote.deleteMany({ targetType: 'comment', target: comment._id });

  let soft = false;
  if (hasReplies) {
    soft = true;
    comment.isDeleted = true;
    comment.body = '';
    comment.score = 0;
    await comment.save();
  } else {
    await comment.deleteOne();
  }

  const Parent = comment.targetType === 'solution' ? Solution : Thread;
  await Parent.updateOne({ _id: comment.target, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });

  new ApiResponse(200, { deleted: true, soft }).send(res);
});

// -------------------------------------------------------------- Vote / Report

// POST /community/votes
export const castVote = asyncHandler(async (req, res) => {
  const { targetType, targetId, value } = req.body;
  if (targetType === 'solution' && value === -1) {
    throw ApiError.badRequest('Solutions can only be upvoted');
  }
  const target = await loadTarget(targetType, targetId);
  if (target.isDeleted) throw ApiError.badRequest('This comment was deleted');
  if (isOwner(target, req.user)) throw ApiError.badRequest("You can't vote on your own post");

  const result = await applyVote({ userId: req.user.id, targetType, targetId: target._id, value });
  new ApiResponse(200, result).send(res);
});

// POST /community/reports
export const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, note } = req.body;
  const target = await loadTarget(targetType, targetId);
  if (isOwner(target, req.user)) throw ApiError.badRequest("You can't report your own post");

  try {
    await Report.create({ reporter: req.user.id, targetType, target: target._id, reason, note });
  } catch (err) {
    if (err?.code === 11000) throw ApiError.conflict('You already reported this');
    throw err;
  }
  new ApiResponse(201, { reported: true }, 'Thanks — our team will review it').send(res);
});
