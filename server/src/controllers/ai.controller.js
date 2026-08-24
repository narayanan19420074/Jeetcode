import { Problem } from '../models/Problem.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getHint } from '../services/ai.service.js';

export const requestHint = asyncHandler(async (req, res) => {
  const { problemSlug, language, code, question, history } = req.body;

  const problem = await Problem.findOne({ slug: problemSlug, isPublished: true }).select('title difficulty description');
  if (!problem) throw ApiError.notFound('Problem not found');

  const hint = await getHint({ problem, language, code, question, history });
  new ApiResponse(200, { hint }).send(res);
});
