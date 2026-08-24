import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeAttempt } from '../models/AptitudeAttempt.js';
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

// GET /api/aptitude/patterns/:slug — pattern detail + recent test attempts.
export const getPatternBySlug = asyncHandler(async (req, res) => {
  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!pattern) throw ApiError.notFound('Pattern not found');

  await aptitudeService.assertPatternUnlocked(req.user.id, pattern);

  const recentAttempts = await AptitudeAttempt.find({ user: req.user.id, pattern: pattern._id, mode: 'test' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('score status createdAt timeTakenSec');

  new ApiResponse(200, { pattern, recentAttempts }).send(res);
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

// POST /api/aptitude/patterns/:slug/start — mode: 'test' | 'practice'.
export const startAttempt = asyncHandler(async (req, res) => {
  const { mode } = req.body;
  const pattern = await AptitudePattern.findOne({ slug: req.params.slug, isPublished: true });
  if (!pattern) throw ApiError.notFound('Pattern not found');

  await aptitudeService.assertPatternUnlocked(req.user.id, pattern);

  const attempt = await aptitudeService.startAttempt({ userId: req.user.id, pattern, mode });
  new ApiResponse(
    201,
    { attemptId: attempt._id, mode: attempt.mode, expiresAt: attempt.expiresAt, totalCount: attempt.totalCount },
    'Attempt started'
  ).send(res);
});

// GET /api/aptitude/attempts/:attemptId/questions — publicProjection only,
// same anti-cheat reasoning as getProblemBySlug never returning driverCode.
export const getAttemptQuestions = asyncHandler(async (req, res) => {
  const attempt = await AptitudeAttempt.findOne({ _id: req.params.attemptId, user: req.user.id });
  if (!attempt) throw ApiError.notFound('Attempt not found');

  const questionIds = attempt.answers.map((a) => a.question);
  const questions = await AptitudeQuestion.find(
    { _id: { $in: questionIds } },
    AptitudeQuestion.publicProjection()
  ).sort({ order: 1 });

  new ApiResponse(200, {
    questions,
    expiresAt: attempt.expiresAt,
    mode: attempt.mode,
    status: attempt.status,
  }).send(res);
});

// POST /api/aptitude/attempts/:attemptId/check — practice mode only, instant
// per-question feedback without ending the attempt.
export const checkAnswer = asyncHandler(async (req, res) => {
  const attempt = await AptitudeAttempt.findOne({ _id: req.params.attemptId, user: req.user.id });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.mode !== 'practice') throw ApiError.badRequest('Instant check is only available in practice mode');

  const { questionId, selectedOption } = req.body;
  const result = await aptitudeService.checkSingleAnswer({ attempt, questionId, selectedOption });
  new ApiResponse(200, result).send(res);
});

// POST /api/aptitude/attempts/:attemptId/submit — final grade; test mode
// also updates AptitudeProgress + the unlock chain (see aptitude.service.js).
export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await AptitudeAttempt.findOne({ _id: req.params.attemptId, user: req.user.id });
  if (!attempt) throw ApiError.notFound('Attempt not found');

  const result = await aptitudeService.submitAttempt({ attempt, incomingAnswers: req.body.answers });
  new ApiResponse(200, {
    score: result.score,
    correctCount: result.correctCount,
    totalCount: result.totalCount,
    status: result.status,
    answers: result.answers,
  }).send(res);
});

// --- Admin ---
// Mirrors createProblem/updateProblem/deleteProblem/publishProblem exactly.
// This IS "namma pudhu aptitude pattern/questions add pannuradhu".

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

// GET /api/aptitude/attempts/:attemptId — fetch a single attempt with populated
// question details. Used primarily for the Results page on hard refresh.
export const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await AptitudeAttempt.findOne({
    _id: req.params.attemptId,
    user: req.user.id,
  }).populate('answers.question'); // Populates the 'question' field inside the answers array

  if (!attempt) throw ApiError.notFound('Attempt not found');

  // Re-shape the response to match the exact structure the frontend expects:
  // { score, correctCount, totalCount, status, answers: [ { question: {...}, selectedOption, isCorrect } ] }
  const result = {
    score: attempt.score,
    correctCount: attempt.correctCount,
    totalCount: attempt.totalCount,
    status: attempt.status,
    answers: attempt.answers.map((ans) => ({
      question: ans.question, // fully populated question object
      selectedOption: ans.selectedOption,
      isCorrect: ans.isCorrect,
    })),
  };

  new ApiResponse(200, { result, expiresAt: attempt.expiresAt }).send(res);
});