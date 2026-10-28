import { MockAttempt } from '../models/MockAttempt.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as mock from '../services/mockTest.service.js';

async function loadOwn(req) {
  const attempt = await MockAttempt.findOne({ _id: req.params.attemptId, user: req.user.id });
  if (!attempt) throw ApiError.notFound('Mock attempt not found');
  return attempt;
}

// GET /api/mocks
export const listMocks = asyncHandler(async (req, res) => {
  new ApiResponse(200, await mock.listMocks(req.user.id, req.hasProAccess)).send(res);
});

// POST /api/mocks/:paperId/start (idempotent: resumes an open paper)
export const startMock = asyncHandler(async (req, res) => {
  const { attempt, resumed } = await mock.startMock({ userId: req.user.id, paperId: req.params.paperId, hasProAccess: req.hasProAccess });
  new ApiResponse(201, { attemptId: String(attempt._id), resumed }).send(res);
});

// GET /api/mocks/attempts/:attemptId/paper (current section only, no answer key)
export const getPaper = asyncHandler(async (req, res) => {
  let attempt = await loadOwn(req);
  attempt = await mock.syncClock(attempt);
  if (attempt.status !== 'in-progress') {
    return new ApiResponse(200, { finished: true, attemptId: String(attempt._id) }).send(res);
  }
  new ApiResponse(200, { finished: false, attemptId: String(attempt._id), ...(await mock.getPaper(attempt)) }).send(res);
});

// POST /api/mocks/attempts/:attemptId/save  { updates: [...] }
export const save = asyncHandler(async (req, res) => {
  const attempt = await loadOwn(req);
  const out = await mock.saveProgress(attempt, req.body.updates);
  new ApiResponse(200, {
    saved: !out.expired && !out.moved,
    finished: Boolean(out.finished),
    moved: Boolean(out.moved),
    serverNow: new Date().toISOString(),
  }).send(res);
});

// POST /api/mocks/attempts/:attemptId/section-submit  { updates }
export const submitSection = asyncHandler(async (req, res) => {
  const attempt = await loadOwn(req);
  const out = await mock.submitSection(attempt, req.body.updates);
  new ApiResponse(200, { finished: out.status !== 'in-progress', attemptId: String(out._id) }).send(res);
});

// POST /api/mocks/attempts/:attemptId/submit  { updates }
export const submitAll = asyncHandler(async (req, res) => {
  const attempt = await loadOwn(req);
  const out = await mock.submitAll(attempt, req.body.updates);
  new ApiResponse(200, { attemptId: String(out._id), score: out.score, status: out.status }).send(res);
});

// GET /api/mocks/attempts/:attemptId/result (answer key; refuses in-progress papers)
export const getResult = asyncHandler(async (req, res) => {
  let attempt = await loadOwn(req);
  attempt = await mock.syncClock(attempt);
  if (attempt.status === 'in-progress') throw ApiError.conflict('This mock is still in progress');
  new ApiResponse(200, await mock.buildResult(attempt)).send(res);
});
