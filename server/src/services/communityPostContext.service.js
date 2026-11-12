import { JobProfile } from '../models/JobProfile.js';
import { User } from '../models/User.js';
import { Vote } from '../models/Vote.js';
import { AUTHOR_FIELDS } from './community.service.js';
import { getFriendIds } from './friend.service.js';

const isNamed = (post) => !post.isAnonymous && Boolean(post.author);

// The headline comes from the author's Job profile. Anonymous authors are never looked up, so their headline
// can never be matched to a named post of the same person.
async function findAuthorHeadlines(posts) {
  const authorIds = [...new Set(posts.filter(isNamed).map((post) => String(post.author._id)))];
  if (!authorIds.length) return new Map();
  const rows = await JobProfile.find({ user: { $in: authorIds } }).select('user headline').lean();
  return new Map(rows.map((row) => [String(row.user), row.headline]));
}

// The most recent like of each post that comes from one of the viewer's friends. A friend who wrote the post
// is skipped: "X likes this" above X's own post says nothing.
async function findFriendLikes(posts, user) {
  if (!user || !posts.length) return new Map();
  const friendIds = await getFriendIds(user.id);
  if (!friendIds.length) return new Map();
  const authorOf = new Map(posts.map((post) => [String(post._id), String(post.author?._id)]));
  const votes = await Vote.find({ targetType: 'post', target: { $in: [...authorOf.keys()] }, user: { $in: friendIds }, value: 1 })
    .sort({ createdAt: -1 })
    .select('target user')
    .lean();
  const likerByPost = new Map();
  votes.forEach((vote) => {
    const postId = String(vote.target);
    if (!likerByPost.has(postId) && String(vote.user) !== authorOf.get(postId)) likerByPost.set(postId, String(vote.user));
  });
  return likerByPost;
}

async function loadLikers(likerByPost) {
  const likerIds = [...new Set(likerByPost.values())];
  if (!likerIds.length) return new Map();
  const users = await User.find({ _id: { $in: likerIds } }).select(AUTHOR_FIELDS).lean();
  return new Map(users.map((liker) => [String(liker._id), liker]));
}

// Adds what the phone feed shows around a post: the author's headline and the friend who liked it (or null).
export async function addSocialContext(posts, user) {
  const [headlines, likerByPost] = await Promise.all([findAuthorHeadlines(posts), findFriendLikes(posts, user)]);
  const likers = await loadLikers(likerByPost);
  return posts.map((post) => ({
    ...post,
    authorHeadline: isNamed(post) ? headlines.get(String(post.author._id)) ?? '' : '',
    likedByFriend: likers.get(likerByPost.get(String(post._id))) ?? null,
  }));
}
