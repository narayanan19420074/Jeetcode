import { CommunityPost } from '../models/CommunityPost.js';
import { ApiError } from '../utils/ApiError.js';
import { AUTHOR_FIELDS, decorate, makeExcerpt, toObjectId } from './community.service.js';
import { findOwnedImageIds, markImagesAttached } from './communityImage.service.js';
import { applyViewerPreferences } from './communityPreference.service.js';
import { addViewerState } from './communityViewerState.service.js';
import { addSocialContext } from './communityPostContext.service.js';
import { assertCanPublish } from './communityChannel.service.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Posts of a group or newsletter appear only inside it. The main feed skips them; the Saved list keeps them, because
// saving is the viewer's own choice.
const channelScope = ({ channel, saved }) => {
  if (channel) return { channel };
  return saved ? {} : { channel: null };
};

export const buildPostFilter = ({ category, q, channel, saved }) => {
  const filter = { ...(category ? { category } : {}), ...channelScope({ channel, saved }) };
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
  const withViewerState = await addViewerState(decorated, user);
  const withSocialContext = await addSocialContext(withViewerState, user);
  return withSocialContext.map(hideAnonymousAuthor);
}

export async function findPostPage({ category, sort, q, saved, channel, page, limit }, user) {
  const filter = await applyViewerPreferences(buildPostFilter({ category, q, channel, saved: saved === 'true' }), user, saved === 'true');
  const [rows, total] = await Promise.all([
    CommunityPost.find(filter).select('-body').sort(postSortSpec(sort)).skip((page - 1) * limit).limit(limit).populate('author', AUTHOR_FIELDS).lean(),
    CommunityPost.countDocuments(filter),
  ]);
  return { rows, total };
}

export async function createPostForUser(userId, { title, body, category, isAnonymous, channel }) {
  if (channel) await assertCanPublish(userId, channel);
  const imageIds = await findOwnedImageIds(userId, body);
  const post = await CommunityPost.create({ author: userId, title, body, category, isAnonymous, channel: channel || null, excerpt: makeExcerpt(body), coverImage: imageIds[0] || '' });
  await markImagesAttached(imageIds);
  return CommunityPost.findById(post._id).select('-body').populate('author', AUTHOR_FIELDS).lean();
}

// Each open of the post page counts as one view; the counter is only a popularity hint, so no per-user dedupe.
export async function loadPostAndCountView(id) {
  toObjectId(id, 'Post');
  const post = await CommunityPost.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true }).populate('author', AUTHOR_FIELDS).lean();
  if (!post) throw ApiError.notFound('Post not found');
  return post;
}
