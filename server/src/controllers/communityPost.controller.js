import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cascadeDelete, isOwner, loadTarget } from '../services/community.service.js';
import { createPostForUser, findPostPage, loadPostAndCountView, presentPosts } from '../services/communityPost.service.js';
import { deleteImagesOfPost } from '../services/communityImage.service.js';

// GET /community/posts
export const listPosts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { rows, total } = await findPostPage(req.query, req.user);
  const items = await presentPosts(rows, req.user);
  new ApiResponse(200, { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }).send(res);
});

// POST /community/posts
export const createPost = asyncHandler(async (req, res) => {
  const created = await createPostForUser(req.user.id, req.body);
  const [item] = await presentPosts([created], req.user);
  new ApiResponse(201, item, 'Post published').send(res);
});

// GET /community/posts/:id
export const getPost = asyncHandler(async (req, res) => {
  const post = await loadPostAndCountView(req.params.id);
  const [item] = await presentPosts([post], req.user);
  new ApiResponse(200, item).send(res);
});

// DELETE /community/posts/:id
export const deletePost = asyncHandler(async (req, res) => {
  const post = await loadTarget('post', req.params.id);
  if (!isOwner(post, req.user) && req.user.role !== 'admin') throw ApiError.forbidden();
  await deleteImagesOfPost(post);
  await cascadeDelete('post', post);
  new ApiResponse(200, { deleted: true }).send(res);
});
