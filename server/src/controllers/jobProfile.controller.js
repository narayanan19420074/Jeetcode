import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getJobProfile, getMemberJobProfile, saveJobProfile } from '../services/jobProfile.service.js';

// GET /api/job-profile/me
export const getMyJobProfile = asyncHandler(async (req, res) => {
  const profile = await getJobProfile(req.user.id);
  new ApiResponse(200, profile).send(res);
});

// GET /api/job-profile/:userId — another member's profile, read-only.
export const getMemberJobProfileById = asyncHandler(async (req, res) => {
  new ApiResponse(200, await getMemberJobProfile(req.params.userId, req.user.id)).send(res);
});

// PUT /api/job-profile/me — replaces the whole profile with the validated body.
export const saveMyJobProfile = asyncHandler(async (req, res) => {
  const profile = await saveJobProfile(req.user.id, req.body);
  new ApiResponse(200, profile, 'Job profile saved').send(res);
});
