import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loadTarget } from '../services/community.service.js';
import { hideAuthorOfPost, hidePostForUser, setPostSaved } from '../services/communityPreference.service.js';
import { setPostReposted } from '../services/communityRepost.service.js';
import { setFollowing } from '../services/communityFollow.service.js';

// Every post action loads the post first, so a missing or malformed id is answered with 404 before anything is written.
const postAction = (perform) =>
  asyncHandler(async (req, res) => {
    const post = await loadTarget('post', req.params.id);
    new ApiResponse(200, await perform(req.user.id, post)).send(res);
  });

// PUT / DELETE /community/posts/:id/save
export const savePost = postAction((userId, post) => setPostSaved(userId, post, true));
export const unsavePost = postAction((userId, post) => setPostSaved(userId, post, false));

// PUT / DELETE /community/posts/:id/repost
export const repostPost = postAction((userId, post) => setPostReposted(userId, post, true));
export const unrepostPost = postAction((userId, post) => setPostReposted(userId, post, false));

// PUT /community/posts/:id/hide ("Not interested") and /hide-author ("Hide posts by ...")
export const hidePost = postAction(hidePostForUser);
export const hidePostAuthor = postAction(hideAuthorOfPost);

const followAction = (following) =>
  asyncHandler(async (req, res) => {
    new ApiResponse(200, await setFollowing(req.user.id, req.params.userId, following)).send(res);
  });

// PUT / DELETE /community/follows/:userId
export const followUser = followAction(true);
export const unfollowUser = followAction(false);
