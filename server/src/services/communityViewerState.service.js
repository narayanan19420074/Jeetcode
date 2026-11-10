import { findFollowedUserIds } from './communityFollow.service.js';
import { findSavedPostIds } from './communityPreference.service.js';
import { findRepostedPostIds } from './communityRepost.service.js';

const NO_VIEWER_STATE = { isSaved: false, isReposted: false, isFollowingAuthor: false };

// Authors of anonymous posts are never followable, so their ids are not looked up at all.
const namedAuthorIds = (posts) => posts.filter((post) => !post.isAnonymous && post.author).map((post) => String(post.author._id));

// Adds what the signed-in viewer did with each post (saved, reposted, follows the author) and a repost count that is
// always a number, because posts created before reposts existed do not store one.
export async function addViewerState(posts, user) {
  const withCounts = posts.map((post) => ({ ...post, repostCount: post.repostCount ?? 0 }));
  if (!user || !posts.length) return withCounts.map((post) => ({ ...post, ...NO_VIEWER_STATE }));
  const postIds = posts.map((post) => post._id);
  const [saved, reposted, followed] = await Promise.all([
    findSavedPostIds(user.id, postIds),
    findRepostedPostIds(user.id, postIds),
    findFollowedUserIds(user.id, namedAuthorIds(posts)),
  ]);
  return withCounts.map((post) => ({
    ...post,
    isSaved: saved.has(String(post._id)),
    isReposted: reposted.has(String(post._id)),
    isFollowingAuthor: !post.isAnonymous && followed.has(String(post.author?._id)),
  }));
}
