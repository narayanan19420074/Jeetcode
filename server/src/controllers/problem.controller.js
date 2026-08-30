import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { applyHarnessGeneration } from '../services/harnessGenerator.service.js';

const DIFFICULTY_RANK = {
  $switch: {
    branches: [
      { case: { $eq: ['$difficulty', 'Easy'] }, then: 1 },
      { case: { $eq: ['$difficulty', 'Medium'] }, then: 2 },
      { case: { $eq: ['$difficulty', 'Hard'] }, then: 3 },
    ],
    default: 0,
  },
};

const ACCEPTANCE_COMPUTED = {
  $cond: [
    { $eq: ['$totalSubmissions', 0] },
    0,
    { $multiply: [{ $divide: ['$acceptedSubmissions', '$totalSubmissions'] }, 100] },
  ],
};

// Shared by listProblems and getRandomProblem — builds the base $match
// filter (difficulty / tags / companies / text search / solved-status),
// fetching the user's solved list only when a status filter or the
// solvedByMe annotation actually needs it.
async function buildProblemFilter({ difficulty, tag, company, search, status, userId }) {
  const filter = { isPublished: true };
  if (difficulty) filter.difficulty = difficulty;
  if (tag) filter.tags = { $in: Array.isArray(tag) ? tag : [tag] };
  if (company) filter.companies = { $in: Array.isArray(company) ? company : [company] };
  if (search) filter.$text = { $search: search };

  let solvedIds = [];
  if (userId) {
    const user = await User.findById(userId).select('solvedProblems').lean();
    solvedIds = (user?.solvedProblems || []).map((id) => id.toString());
  }

  if (status === 'solved') {
    if (!userId) throw ApiError.unauthorized('Log in to filter by solved status');
    filter._id = { $in: solvedIds };
  } else if (status === 'unsolved') {
    if (userId) filter._id = { $nin: solvedIds };
  }

  return { filter, solvedIds };
}

// GET /api/problems — the Problem Explorer table/cards. Public
// (guest-accessible), but flags solvedByMe when a valid token is present
// via attachUserIfPresent, and honors ?status=solved|unsolved for users
// who are logged in.
//
// Rebuilt on an aggregation pipeline (instead of .find()) so sort can
// cover fields that aren't stored directly — difficulty (Easy/Medium/Hard
// has no natural sort order as a string) and acceptance rate (a ratio of
// two counters, not a column). $facet gets items + total count in one
// round trip instead of two separate queries.
//
// Premium (company-tagged) problems still appear in the list — title,
// difficulty, acceptance rate all visible — but with `locked: true` and
// `companies` stripped, so a non-Pro user sees the problem exists and
// which ones are premium without the gated detail (the company tags
// *are* the premium content here, per the LeetCode Premium model).
export const listProblems = asyncHandler(async (req, res) => {
  const { page, limit, difficulty, tag, company, search, status, sort } = req.query;

  const { filter, solvedIds } = await buildProblemFilter({
    difficulty,
    tag,
    company,
    search,
    status,
    userId: req.user?.id,
  });

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: filter },
    {
      $addFields: {
        difficultyRank: DIFFICULTY_RANK,
        acceptanceRateComputed: ACCEPTANCE_COMPUTED,
        ...(search ? { textScore: { $meta: 'textScore' } } : {}),
      },
    },
  ];

  if (search) {
    pipeline.push({ $sort: { textScore: -1 } });
  } else if (sort === 'oldest') {
    pipeline.push({ $sort: { createdAt: 1 } });
  } else if (sort === 'difficulty-asc') {
    pipeline.push({ $sort: { difficultyRank: 1 } });
  } else if (sort === 'difficulty-desc') {
    pipeline.push({ $sort: { difficultyRank: -1 } });
  } else if (sort === 'acceptance-asc') {
    pipeline.push({ $sort: { acceptanceRateComputed: 1 } });
  } else if (sort === 'acceptance-desc') {
    pipeline.push({ $sort: { acceptanceRateComputed: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } }); // newest — default
  }

  pipeline.push(
    { $project: { testCases: 0, driverCode: 0, __v: 0 } },
    { $facet: { items: [{ $skip: skip }, { $limit: limit }], meta: [{ $count: 'total' }] } }
  );

  const [result] = await Problem.aggregate(pipeline);
  const items = result.items;
  const total = result.meta[0]?.total || 0;

  const solvedSet = new Set(solvedIds);
  const data = items.map((p) => {
    const isPremium = (p.companies || []).length > 0;
    const locked = isPremium && !req.hasProAccess;
    return {
      ...p,
      companies: locked ? [] : p.companies,
      isPremium,
      locked,
      acceptanceRate: Math.round((p.acceptanceRateComputed || 0) * 10) / 10,
      solvedByMe: solvedSet.has(p._id.toString()),
    };
  });

  new ApiResponse(200, {
    items: data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }).send(res);
});

// GET /api/problems/tags — distinct pattern/topic tags, with counts,
// sorted by frequency. Powers the topics filter row.
export const listProblemTags = asyncHandler(async (req, res) => {
  const tags = await Problem.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);
  new ApiResponse(200, { items: tags }).send(res);
});

// GET /api/problems/companies — same idea as /tags, for the company filter.
export const listProblemCompanies = asyncHandler(async (req, res) => {
  const companies = await Problem.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$companies' },
    { $group: { _id: '$companies', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, company: '$_id', count: 1 } },
  ]);
  new ApiResponse(200, { items: companies }).send(res);
});

// GET /api/problems/progress — solved-vs-total counts per difficulty, for
// the logged-in user. Powers the Problems page progress bar. Guests get
// totals with solved counts at 0.
export const getProblemsProgress = asyncHandler(async (req, res) => {
  const totalsAgg = await Problem.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  ]);
  const totals = { Easy: 0, Medium: 0, Hard: 0 };
  totalsAgg.forEach((t) => {
    totals[t._id] = t.count;
  });

  const solved = { Easy: 0, Medium: 0, Hard: 0 };
  if (req.user) {
    const user = await User.findById(req.user.id).select('solvedProblems').lean();
    const solvedIds = user?.solvedProblems || [];
    if (solvedIds.length > 0) {
      const solvedAgg = await Problem.aggregate([
        { $match: { _id: { $in: solvedIds }, isPublished: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]);
      solvedAgg.forEach((s) => {
        solved[s._id] = s.count;
      });
    }
  }

  new ApiResponse(200, { total: totals, solved }).send(res);
});

// GET /api/problems/random — "Pick One": returns a random problem slug
// matching the current filters (difficulty/tag/company/status), for the
// Problem Explorer's random-pick button.
export const getRandomProblem = asyncHandler(async (req, res) => {
  const { difficulty, tag, company, status } = req.query;
  const { filter } = await buildProblemFilter({ difficulty, tag, company, status, userId: req.user?.id });

  const [problem] = await Problem.aggregate([
    { $match: filter },
    { $sample: { size: 1 } },
    { $project: { slug: 1 } },
  ]);
  if (!problem) throw ApiError.notFound('No problems match these filters');

  new ApiResponse(200, { slug: problem.slug }).send(res);
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
