import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { changeMembership, createChannel, findChannel, findChannelPage } from '../services/communityChannel.service.js';

// GET /community/channels?kind=group|newsletter
export const listChannels = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { items, total } = await findChannelPage(req.query, req.user);
  new ApiResponse(200, { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }).send(res);
});

// POST /community/channels
export const createChannelHandler = asyncHandler(async (req, res) => {
  new ApiResponse(201, await createChannel(req.user.id, req.body), 'Created').send(res);
});

// GET /community/channels/:id
export const getChannel = asyncHandler(async (req, res) => {
  new ApiResponse(200, await findChannel(req.params.id, req.user)).send(res);
});

const membershipAction = (joined) =>
  asyncHandler(async (req, res) => {
    new ApiResponse(200, await changeMembership(req.user.id, req.params.id, joined)).send(res);
  });

// PUT / DELETE /community/channels/:id/membership (join or subscribe, leave or unsubscribe)
export const joinChannel = membershipAction(true);
export const leaveChannel = membershipAction(false);
