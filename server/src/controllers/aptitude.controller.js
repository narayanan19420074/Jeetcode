import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeAttempt } from '../models/AptitudeAttempt.js';
import { AptitudeProgress } from '../models/AptitudeProgress.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import * as aptitudeService from '../services/aptitude.service.js';

// GET /api/aptitude/patterns — home page cards. Public-readable like
// listProblems, progress/unlock is only populated when req.user is present.
export const listPatterns = asyncHandler(async (req, res) => {
  const patterns = await aptitudeService.getPatternsWithProgress(req.user?.id);
  new ApiResponse(200, { items: patterns }).send(res);
});

// GET /api/aptitude/patterns/:slug — hub data: pattern, Learn progress, recent
// test attempts, an in-progress test (if any) and LeetCode-style practice
// stats (difficulty split + per-sub-pattern mastery).
export const getPatternBySlug = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!pattern) throw ApiError.notFound('Pattern not found');

  await aptitudeService.assertPatternUnlocked(req.user.id, pattern);

  const [progressDoc, recentAttempts, openTest, practice] = await Promise.all([
    AptitudeProgress.findOne({ user: req.user.id, pattern: pattern._id }).lean(),
    AptitudeAttempt.find({ user: req.user.id, pattern: pattern._id, mode: 'test', status: { $in: ['completed', 'expired'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('score status correctCount totalCount createdAt timeTakenSec'),
    AptitudeAttempt.findOne({ user: req.user.id, pattern: pattern._id, mode: 'test', status: 'in-progress' }),
    aptitudeService.getPracticeStats(req.user.id, pattern),
  ]);

  // An in-progress test whose clock already ran out is graded now, so the hub
  // never offers "Resume" for a paper that can no longer be continued.
  let activeTest = null;
  if (openTest) {
    const done = await aptitudeService.finalizeIfExpired(openTest);
    if (done.status === 'in-progress') {
      activeTest = {
        attemptId: done._id,
        expiresAt: done.expiresAt,
        totalCount: done.totalCount,
        answeredCount: done.answers.filter((a) => a.selectedOption !== null).length,
      };
    }
  }

  new ApiResponse(200, {
    pattern: { ...pattern, subPatterns: aptitudeService.resolveSubPatterns(pattern, await aptitudeService.getQuestionMeta(pattern._id)) },
    progress: {
      bestScore: progressDoc?.bestScore ?? 0,
      attemptsCount: progressDoc?.attemptsCount ?? 0,
      learnCompleted: progressDoc?.learnCompleted ?? false,
      completedSubsections: progressDoc?.completedSubsections ?? [],
    },
    recentAttempts,
    activeTest,
    practice,
    testPlan: {
      questionCount: Math.min(pattern.testQuestionCount || 25, practice.totals.total),
      requireLearn: aptitudeService.REQUIRE_LEARN_BEFORE_TEST,
    },
  }).send(res);
});

// GET /api/aptitude/patterns/:slug/attempts — full history for this pattern.
export const getAttemptHistory = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findOne({ slug: req.params.slug });
  if (!pattern) throw ApiError.notFound('Pattern not found');

  const attempts = await AptitudeAttempt.find({ user: req.user.id, pattern: pattern._id })
    .sort({ createdAt: -1 })
    .select('mode status score correctCount totalCount timeTakenSec createdAt');

  new ApiResponse(200, { items: attempts }).send(res);
});

// --- Practice (LeetCode-style problem set) -----------------------------

async function loadUnlockedPattern(req) {
  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true });
  if (!pattern) throw ApiError.notFound('Pattern not found');
  await aptitudeService.assertPatternUnlocked(req.user.id, pattern);
  return pattern;
}

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const STATUSES = ['todo', 'attempted', 'solved', 'unsolved', 'bookmarked'];

// GET /api/aptitude/patterns/:slug/practice/questions
//   ?subPattern=&difficulty=&status=&search=&page=&limit=
export const listPracticeQuestions = asyncHandler(async (req, res) => {
  const pattern = await loadUnlockedPattern(req);
  const q = req.query;

  const filters = {
    subPattern: typeof q.subPattern === 'string' && q.subPattern ? q.subPattern.slice(0, 80) : undefined,
    difficulty: DIFFICULTIES.includes(q.difficulty) ? q.difficulty : undefined,
    status: STATUSES.includes(q.status) ? q.status : undefined,
    search: typeof q.search === 'string' && q.search.trim() ? q.search.trim().slice(0, 80) : undefined,
    page: Math.max(1, parseInt(q.page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(q.limit, 10) || 50)),
  };

  const data = await aptitudeService.listPracticeQuestions(req.user.id, pattern, filters);
  new ApiResponse(200, data).send(res);
});

// GET /api/aptitude/patterns/:slug/practice/questions/:questionId
export const getPracticeQuestion = asyncHandler(async (req, res) => {
  const pattern = await loadUnlockedPattern(req);
  const data = await aptitudeService.getPracticeQuestion(req.user.id, pattern, req.params.questionId);
  new ApiResponse(200, data).send(res);
});

// POST /api/aptitude/patterns/:slug/practice/questions/:questionId/check
// Body: { selectedOption: 0-3, timeSpentSec? }
export const checkPracticeAnswer = asyncHandler(async (req, res) => {
  const pattern = await loadUnlockedPattern(req);
  const { selectedOption, timeSpentSec } = req.body;
  if (!Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) {
    throw ApiError.badRequest('selectedOption must be an integer between 0 and 3');
  }
  const data = await aptitudeService.checkPracticeAnswer({
    userId: req.user.id,
    pattern,
    questionId: req.params.questionId,
    selectedOption,
    timeSpentSec,
  });
  new ApiResponse(200, data).send(res);
});

// POST /api/aptitude/patterns/:slug/practice/questions/:questionId/bookmark
// Body: { bookmarked: boolean }
export const bookmarkPracticeQuestion = asyncHandler(async (req, res) => {
  const pattern = await loadUnlockedPattern(req);
  const data = await aptitudeService.setBookmark({
    userId: req.user.id,
    pattern,
    questionId: req.params.questionId,
    bookmarked: req.body.bookmarked !== false,
  });
  new ApiResponse(200, data).send(res);
});

// --- Attempts ------------------------------------------------------------

// POST /api/aptitude/patterns/:slug/start — mode: 'test' | 'practice'.
// Test mode is idempotent: an unexpired in-progress paper is resumed rather
// than replaced.
export const startAttempt = asyncHandler(async (req, res) => {
  const { mode } = req.body;
  if (!['test', 'practice'].includes(mode)) throw ApiError.badRequest("mode must be 'test' or 'practice'");

  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true });
  if (!pattern) throw ApiError.notFound('Pattern not found');

  await aptitudeService.assertPatternUnlocked(req.user.id, pattern);
  if (mode === 'test') await aptitudeService.assertLearnCompleted(req.user.id, pattern);

  const { attempt, resumed } = await aptitudeService.startAttempt({ userId: req.user.id, pattern, mode });
  new ApiResponse(
    resumed ? 200 : 201,
    {
      attemptId: attempt._id,
      mode: attempt.mode,
      expiresAt: attempt.expiresAt,
      totalCount: attempt.totalCount,
      resumed,
    },
    resumed ? 'Resuming your test' : 'Attempt started'
  ).send(res);
});

// POST /api/aptitude/patterns/:slug/complete-learn
// Legacy — marks the entire Learn section done in one shot.
export const completeLearnSection = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true });
  if (!pattern) throw ApiError.notFound('Pattern not found');

  await aptitudeService.markLearnCompleted(req.user.id, pattern._id);
  new ApiResponse(200, null, 'Learn section marked complete').send(res);
});

// POST /api/aptitude/patterns/:slug/learn-progress
// Body: { subsectionId: string, totalSubsections: number }
export const markSubsectionComplete = asyncHandler(async (req, res) => {
  const { subsectionId, totalSubsections } = req.body;

  if (typeof subsectionId !== 'string' || !subsectionId.trim() || subsectionId.length > 100) {
    throw ApiError.badRequest('subsectionId is required and must be a string under 100 chars');
  }
  if (!Number.isInteger(totalSubsections) || totalSubsections < 1 || totalSubsections > 50) {
    throw ApiError.badRequest('totalSubsections must be an integer between 1 and 50');
  }

  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true });
  if (!pattern) throw ApiError.notFound('Pattern not found');

  const progress = await aptitudeService.markSubsectionComplete(
    req.user.id,
    pattern._id,
    subsectionId.trim(),
    totalSubsections
  );

  new ApiResponse(
    200,
    { completedSubsections: progress.completedSubsections, learnCompleted: progress.learnCompleted },
    'Subsection marked complete'
  ).send(res);
});

async function loadOwnAttempt(req) {
  const attempt = await AptitudeAttempt.findOne({ _id: req.params.attemptId, user: req.user.id });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  return attempt;
}

// GET /api/aptitude/attempts/:attemptId/questions — publicProjection only,
// in attempt order, with shared stimuli, the learner's saved palette state
// and server time (so the countdown can't be skewed by a wrong device clock).
export const getAttemptQuestions = asyncHandler(async (req, res) => {
  let attempt = await loadOwnAttempt(req);
  attempt = await aptitudeService.finalizeIfExpired(attempt);

  // Once graded, the paper (and its answer key) is no longer served here —
  // the Results endpoint is the only path to the key.
  if (attempt.status !== 'in-progress') {
    return new ApiResponse(200, { status: attempt.status, mode: attempt.mode, questions: [], sets: [], state: {} }).send(res);
  }

  const paper = await aptitudeService.getAttemptPaper(attempt);
  new ApiResponse(200, {
    ...paper,
    expiresAt: attempt.expiresAt,
    startedAt: attempt.startedAt,
    serverNow: new Date().toISOString(),
    mode: attempt.mode,
    status: attempt.status,
  }).send(res);
});

// POST /api/aptitude/attempts/:attemptId/save — exam-interface autosave.
// Body: { updates: [{ questionId, selectedOption|null, markedForReview, visited, timeSpentSec }] }
export const saveAttemptProgress = asyncHandler(async (req, res) => {
  const attempt = await loadOwnAttempt(req);
  if (attempt.mode !== 'test') throw ApiError.badRequest('Autosave is only used in test mode');

  const { expired } = await aptitudeService.saveAttemptProgress(attempt, req.body.updates);
  new ApiResponse(200, { saved: !expired, expired, serverNow: new Date().toISOString() }).send(res);
});

// POST /api/aptitude/attempts/:attemptId/check — legacy practice *session*
// instant check. The current UI uses the per-question practice endpoints.
export const checkAnswer = asyncHandler(async (req, res) => {
  const attempt = await loadOwnAttempt(req);
  if (attempt.mode !== 'practice') throw ApiError.badRequest('Instant check is only available in practice mode');

  const { questionId, selectedOption } = req.body;
  const result = await aptitudeService.checkSingleAnswer({ attempt, questionId, selectedOption });
  new ApiResponse(200, result).send(res);
});

// POST /api/aptitude/attempts/:attemptId/submit — final grade; test mode
// also updates AptitudeProgress + the unlock chain (see aptitude.service.js).
// Body: { answers|updates: [...] } — last unsaved changes from the client.
export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await loadOwnAttempt(req);

  const result = await aptitudeService.submitAttempt({
    attempt,
    incomingAnswers: req.body.updates ?? req.body.answers,
  });
  new ApiResponse(200, {
    attemptId: result._id,
    score: result.score,
    correctCount: result.correctCount,
    totalCount: result.totalCount,
    status: result.status,
  }).send(res);
});

// GET /api/aptitude/attempts/:attemptId — finished attempt with full review
// data + breakdowns. Refuses in-progress attempts (that would hand out the
// answer key mid-test).
export const getAttempt = asyncHandler(async (req, res) => {
  let attempt = await loadOwnAttempt(req);
  attempt = await aptitudeService.finalizeIfExpired(attempt);

  if (attempt.status === 'in-progress') {
    throw ApiError.conflict('This attempt is still in progress');
  }

  const pattern = await AptitudePattern.findById(attempt.pattern).lean();
  const result = await aptitudeService.buildAttemptResult(attempt, pattern);

  let nextPattern = null;
  if (result.passed) {
    const next = await AptitudePattern.findOne({ isPublished: true, order: { $gt: pattern.order } })
      .sort({ order: 1 })
      .select('title slug')
      .lean();
    nextPattern = next ? { title: next.title, slug: next.slug } : null;
  }

  new ApiResponse(200, {
    result,
    pattern: {
      title: pattern.title,
      slug: pattern.slug,
      passPercentage: pattern.passPercentage,
    },
    nextPattern,
    expiresAt: attempt.expiresAt,
  }).send(res);
});

// --- Admin ---

export const adminListPatterns = asyncHandler(async (req, res) => {
  const patterns = await AptitudePattern.find().sort({ order: 1 }).lean();
  new ApiResponse(200, { items: patterns }).send(res);
});

export const createPattern = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.title);
  const exists = await AptitudePattern.findOne({ slug });
  if (exists) throw ApiError.conflict('A pattern with this title (slug) already exists');

  const pattern = await AptitudePattern.create({ ...req.body, slug, createdBy: req.user.id });
  new ApiResponse(201, pattern, 'Pattern created').send(res);
});

export const updatePattern = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.title) update.slug = slugify(update.title);

  const pattern = await AptitudePattern.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!pattern) throw ApiError.notFound('Pattern not found');
  new ApiResponse(200, pattern, 'Pattern updated').send(res);
});

export const deletePattern = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findByIdAndDelete(req.params.id);
  if (!pattern) throw ApiError.notFound('Pattern not found');
  await AptitudeQuestion.deleteMany({ pattern: pattern._id });
  new ApiResponse(200, null, 'Pattern and its questions deleted').send(res);
});

export const publishPattern = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findByIdAndUpdate(
    req.params.id,
    { isPublished: req.body.isPublished ?? true },
    { new: true }
  );
  if (!pattern) throw ApiError.notFound('Pattern not found');
  new ApiResponse(200, pattern, pattern.isPublished ? 'Pattern published' : 'Pattern unpublished').send(res);
});

export const adminListQuestions = asyncHandler(async (req, res) => {
  const { patternId } = req.query;
  const filter = patternId ? { pattern: patternId } : {};
  const questions = await AptitudeQuestion.find(filter).sort({ pattern: 1, order: 1 }).lean();
  new ApiResponse(200, { items: questions }).send(res);
});

export const createQuestion = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findById(req.body.pattern);
  if (!pattern) throw ApiError.notFound('Pattern not found');

  const question = await AptitudeQuestion.create({ ...req.body, createdBy: req.user.id });
  await aptitudeService.recountPatternQuestions(pattern._id);
  new ApiResponse(201, question, 'Question created').send(res);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await AptitudeQuestion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) throw ApiError.notFound('Question not found');
  await aptitudeService.recountPatternQuestions(question.pattern);
  new ApiResponse(200, question, 'Question updated').send(res);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await AptitudeQuestion.findByIdAndDelete(req.params.id);
  if (!question) throw ApiError.notFound('Question not found');
  await aptitudeService.recountPatternQuestions(question.pattern);
  new ApiResponse(200, null, 'Question deleted').send(res);
});
