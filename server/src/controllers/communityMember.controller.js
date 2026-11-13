import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { searchMembers } from '../services/communityMember.service.js';
import { suggestMembers } from '../services/communityMemberSuggestion.service.js';

// GET /community/members/search?q= — every member account whose name, handle, headline or skills match.
export const searchCommunityMembers = asyncHandler(async (req, res) => {
  new ApiResponse(200, await searchMembers(req.user.id, req.query.q)).send(res);
});

// GET /community/members/suggested?limit= — members the viewer may want to follow.
export const listSuggestedMembers = asyncHandler(async (req, res) => {
  new ApiResponse(200, await suggestMembers(req.user.id, req.query.limit)).send(res);
});
