import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { applyHarnessGeneration } from '../services/harnessGenerator.service.js';

// GET /api/problems — the Problem Explorer table. Public (guest-accessible),
// but flags solvedByMe when a valid token is present via attachUserIfPresent.
//
// Premium (company-tagged) problems still appear in the list — title,
// difficulty, acceptance rate all visible — but with `locked: true` and
// `companies` stripped, so a non-Pro user sees the problem exists and
// which ones are premium without the gated detail (the company tags
// *are* the premium content here, per the LeetCode Premium model).
export const listProblems = asyncHandler(async (req, res) => {
  const { page, limit, difficulty, tag, search } = req.query;

  const filter = { isPublished: true };
  if (difficulty) filter.difficulty = difficulty;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Problem.find(filter, Problem.publicProjection())
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Problem.countDocuments(filter),
  ]);

  let solvedSet = new Set();
  if (req.user) {
    const user = await User.findById(req.user.id).select('solvedProblems').lean();
    solvedSet = new Set((user?.solvedProblems || []).map((id) => id.toString()));
  }

  // .lean() skips Mongoose virtuals, so isPremium is computed inline here
  // rather than relying on the schema virtual (that virtual still exists
  // for any non-lean query path elsewhere, e.g. admin views).
  const data = items.map((p) => {
    const isPremium = (p.companies || []).length > 0;
    const locked = isPremium && !req.hasProAccess;
    return {
      ...p,
      companies: locked ? [] : p.companies,
      isPremium,
      locked,
      acceptanceRate: p.totalSubmissions ? Math.round((p.acceptedSubmissions / p.totalSubmissions) * 1000) / 10 : 0,
      solvedByMe: solvedSet.has(p._id.toString()),
    };
  });

  new ApiResponse(200, {
    items: data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }).send(res);
});

// GET /api/problems/:slug — Workspace left pane. Never returns testCases
// or driverCode (see Problem.publicProjection). Premium problems reject
// outright for non-Pro users — unlike the list view, there's no partial
// view here; the description/examples/starter code are the paid content.
export const getProblemBySlug = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne(
    { slug: req.params.slug, isPublished: true },
    Problem.publicProjection()
  ).lean();
  if (!problem) throw ApiError.notFound('Problem not found');

  const isPremium = (problem.companies || []).length > 0;
  if (isPremium && !req.hasProAccess) {
    throw ApiError.paymentRequired('This problem requires a Pro subscription');
  }

  new ApiResponse(200, { ...problem, isPremium }).send(res);
});

// --- Admin ---

// GET /api/admin/problems — includes unpublished + full detail, for the review queue.
export const adminListProblems = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Problem.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Problem.countDocuments(),
  ]);
  new ApiResponse(200, { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }).send(res);
});

// POST /api/admin/problems — this IS "namma pudhu questions add pannuradhu".
export const createProblem = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.title);
  const exists = await Problem.findOne({ slug });
  if (exists) throw ApiError.conflict('A problem with this title (slug) already exists');

  const payload = applyHarnessGeneration({ ...req.body });
  const problem = await Problem.create({ ...payload, slug, createdBy: req.user.id });
  new ApiResponse(201, problem, 'Problem created').send(res);
});

export const updateProblem = asyncHandler(async (req, res) => {
  const update = applyHarnessGeneration({ ...req.body });
  if (update.title) update.slug = slugify(update.title);

  const problem = await Problem.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!problem) throw ApiError.notFound('Problem not found');
  new ApiResponse(200, problem, 'Problem updated').send(res);
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) throw ApiError.notFound('Problem not found');
  new ApiResponse(200, null, 'Problem deleted').send(res);
});

export const publishProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(
    req.params.id,
    { isPublished: req.body.isPublished ?? true },
    { new: true }
  );
  if (!problem) throw ApiError.notFound('Problem not found');
  new ApiResponse(200, problem, problem.isPublished ? 'Problem published' : 'Problem unpublished').send(res);
});
