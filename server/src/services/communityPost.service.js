import { CommunityPost } from '../models/CommunityPost.js';
import { ApiError } from '../utils/ApiError.js';
import { AUTHOR_FIELDS, decorate, makeExcerpt, toObjectId } from './community.service.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildPostFilter = ({ category, q }) => {
  const filter = category ? { category } : {};
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: pattern }, { body: pattern }];
  }
  return filter;
};

export const postSortSpec = (sort) => (sort === 'top' ? { score: -1, createdAt: -1 } : { createdAt: -1 });

// Anonymous posts never expose the author. `isMine` is computed before this runs, so owners still get their controls.
const hideAnonymousAuthor = (post) => (post.isAnonymous ? { ...post, author: null } : post);

export async function presentPosts(rows, user) {
  const decorated = await decorate(rows, 'post', user);
  return decorated.map(hideAnonymousAuthor);
}

export async function findPostPage({ category, sort, q, page, limit }) {
  const filter = buildPostFilter({ category, q });
  const [rows, total] = await Promise.all([
    CommunityPost.find(filter).select('-body').sort(postSortSpec(sort)).skip((page - 1) * limit).limit(limit).populate('author', AUTHOR_FIELDS).lean(),
    CommunityPost.countDocuments(filter),
  ]);
  return { rows, total };
}

export async function createPostForUser(userId, { title, body, category, isAnonymous }) {
  const post = await CommunityPost.create({ author: userId, title, body, category, isAnonymous, excerpt: makeExcerpt(body) });
  return CommunityPost.findById(post._id).select('-body').populate('author', AUTHOR_FIELDS).lean();
}

// Each open of the post page counts as one view; the counter is only a popularity hint, so no per-user dedupe.
export async function loadPostAndCountView(id) {
  toObjectId(id, 'Post');
  const post = await CommunityPost.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true }).populate('author', AUTHOR_FIELDS).lean();
  if (!post) throw ApiError.notFound('Post not found');
  return post;
}
