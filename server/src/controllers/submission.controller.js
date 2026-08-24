import { Submission } from '../models/Submission.js';
import { Problem } from '../models/Problem.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { enqueueSubmission } from '../queue/submissionQueue.js';

// POST /api/submissions — covers both "Run" (sample cases only, no
// persistence side-effects) and "Submit" (full hidden suite, updates
// streak/solved counters). Kicks off judging via the queue abstraction —
// caller doesn't know or care whether that's async (Redis) or inline (dev).
export const createSubmission = asyncHandler(async (req, res) => {
  const { problemSlug, language, code, mode } = req.body;

  const problem = await Problem.findOne({ slug: problemSlug, isPublished: true }).select('_id');
  if (!problem) throw ApiError.notFound('Problem not found');

  const submission = await Submission.create({
    user: req.user.id,
    problem: problem._id,
    language,
    code,
    mode,
    status: 'Pending',
  });

  await enqueueSubmission(submission._id.toString());

  // Re-fetch: with the inline fallback (no Redis) the doc is already fully
  // judged by the time enqueueSubmission resolves; with a real queue it's
  // still Pending and the client polls GET /api/submissions/:id.
  const fresh = await Submission.findById(submission._id);
  new ApiResponse(201, fresh).send(res);
});

// GET /api/submissions/:id — poll target while a queued submission judges.
export const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) throw ApiError.notFound('Submission not found');
  if (submission.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  new ApiResponse(200, submission).send(res);
});

// GET /api/submissions/me — Dashboard's "Recent Submissions" table.
export const listMySubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id, mode: 'submit' };

  const [items, total] = await Promise.all([
    Submission.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('problem', 'title slug difficulty')
      .lean(),
    Submission.countDocuments(filter),
  ]);

  new ApiResponse(200, { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }).send(res);
});
