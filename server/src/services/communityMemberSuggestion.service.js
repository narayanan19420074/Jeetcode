import { User } from '../models/User.js';
import { JobProfile } from '../models/JobProfile.js';
import { Follow } from '../models/Follow.js';
import { CommunityPost } from '../models/CommunityPost.js';
import { CommunityPreference } from '../models/CommunityPreference.js';
import { MEMBER_CARD_FIELDS, toMemberCards } from './communityMember.service.js';

// Most recently active members are ranked, so suggestions are people who are around right now.
const CANDIDATE_POOL_SIZE = 200;
const INTEREST_POST_LIMIT = 100;
const MAX_TOPIC_POSTS_COUNTED = 3;
const WEIGHTS = { sharedSkill: 3, sameOrganisation: 2, topicPost: 1 };

const lowerCased = (values) => (values ?? []).map((value) => value.toLowerCase());

// What the viewer is interested in: the skills on their Job profile, their college or company, and the topics of the
// posts they wrote or saved.
async function loadViewerInterests(viewerId, preferences) {
  const savedPostIds = preferences?.savedPosts ?? [];
  const [user, profile, posts] = await Promise.all([
    User.findById(viewerId).select('company').lean(),
    JobProfile.findOne({ user: viewerId }).select('skills').lean(),
    CommunityPost.find({ $or: [{ author: viewerId }, { _id: { $in: savedPostIds } }] }).select('category').limit(INTEREST_POST_LIMIT).lean(),
  ]);
  return {
    organisation: (user?.company ?? '').toLowerCase(),
    skills: new Set(lowerCased(profile?.skills)),
    topics: [...new Set(posts.map((post) => post.category))],
  };
}

// Members the viewer already follows, hid or is themselves are never suggested.
async function loadExcludedIds(viewerId, preferences) {
  const follows = await Follow.find({ follower: viewerId }).select('following').lean();
  return [viewerId, ...follows.map((follow) => follow.following), ...(preferences?.mutedAuthors ?? [])];
}

// Named posts only: an anonymous post must never connect an account to a topic.
async function countTopicPosts(authorIds, topics) {
  if (topics.length === 0) return new Map();
  const rows = await CommunityPost.aggregate([
    { $match: { author: { $in: authorIds }, isAnonymous: false, category: { $in: topics } } },
    { $group: { _id: '$author', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

function scoreMember(user, profile, topicPostCount, interests) {
  const sharedSkills = lowerCased(profile?.skills).filter((skill) => interests.skills.has(skill)).length;
  const sameOrganisation = interests.organisation && (user.company ?? '').toLowerCase() === interests.organisation;
  return sharedSkills * WEIGHTS.sharedSkill + (sameOrganisation ? WEIGHTS.sameOrganisation : 0) + Math.min(topicPostCount, MAX_TOPIC_POSTS_COUNTED) * WEIGHTS.topicPost;
}

// Best match first; members with the same score stay in the order of recent activity.
async function rankCandidates(candidates, interests) {
  const ids = candidates.map((user) => user._id);
  const [profiles, topicPostCounts] = await Promise.all([
    JobProfile.find({ user: { $in: ids } }).select('user skills').lean(),
    countTopicPosts(ids, interests.topics),
  ]);
  const profileByUser = new Map(profiles.map((profile) => [String(profile.user), profile]));
  return candidates
    .map((user) => ({ user, score: scoreMember(user, profileByUser.get(String(user._id)), topicPostCounts.get(String(user._id)) ?? 0, interests) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.user);
}

// "People you may know": active members who share the viewer's skills, college or company and community topics.
export async function suggestMembers(viewerId, limit) {
  const preferences = await CommunityPreference.findOne({ user: viewerId }).select('savedPosts mutedAuthors').lean();
  const [interests, excludedIds] = await Promise.all([loadViewerInterests(viewerId, preferences), loadExcludedIds(viewerId, preferences)]);
  const candidates = await User.find({ _id: { $nin: excludedIds }, role: { $ne: 'admin' } })
    .sort({ lastActivityDate: -1 })
    .limit(CANDIDATE_POOL_SIZE)
    .select(MEMBER_CARD_FIELDS)
    .lean();
  const ranked = await rankCandidates(candidates, interests);
  return toMemberCards(viewerId, ranked.slice(0, limit));
}
