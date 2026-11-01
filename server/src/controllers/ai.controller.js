import { Problem } from '../models/Problem.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getHint, getFixedCode } from '../services/ai.service.js';
import { createLiveSession } from '../services/aiLive.service.js';

async function findPublishedProblem(slug) {
  const problem = await Problem.findOne({ slug, isPublished: true }).select('title difficulty description');
  if (!problem) throw ApiError.notFound('Problem not found');
  return problem;
}

export const requestHint = asyncHandler(async (req, res) => {
  const { problemSlug, language, code, question, history } = req.body;
  const problem = await findPublishedProblem(problemSlug);
  const hint = await getHint({ problem, language, code, question, history });
  new ApiResponse(200, { hint }).send(res);
});

export const requestFix = asyncHandler(async (req, res) => {
  const { problemSlug, language, code } = req.body;
  const problem = await findPublishedProblem(problemSlug);
  const fixedCode = await getFixedCode({ problem, language, code });
  new ApiResponse(200, { code: fixedCode }).send(res);
});

export const requestLiveSession = asyncHandler(async (req, res) => {
  const problem = await findPublishedProblem(req.body.problemSlug);
  const session = await createLiveSession({ problem });
  new ApiResponse(200, session).send(res);
});
