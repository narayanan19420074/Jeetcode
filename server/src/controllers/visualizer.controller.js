import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { traceLearnerCode } from '../services/visualizer.service.js';

// POST /api/visualizer/trace — the learner's code, executed step by step on one sample case.
export const createTrace = asyncHandler(async (req, res) => {
  const trace = await traceLearnerCode(req.body);
  new ApiResponse(200, trace).send(res);
});
