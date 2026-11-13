import { User } from '../models/User.js';
import { JobProfile } from '../models/JobProfile.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { findFollowedUserIds } from './communityFollow.service.js';

export const MEMBER_CARD_FIELDS = 'name handle avatarUrl company';
const SEARCH_LIMIT = 20;

// The card the community shows for a member in search results and suggestions. Without a Job profile headline it
// falls back to the college or company on the account, so every card has a line under the name.
export async function toMemberCards(viewerId, users) {
  const ids = users.map((user) => String(user._id));
  const [profiles, followedIds] = await Promise.all([
    JobProfile.find({ user: { $in: ids } }).select('user headline').lean(),
    findFollowedUserIds(viewerId, ids),
  ]);
  const headlineByUser = new Map(profiles.map((profile) => [String(profile.user), profile.headline]));
  return users.map((user) => ({
    userId: String(user._id),
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl || null,
    headline: headlineByUser.get(String(user._id)) || user.company || '',
    isFollowing: followedIds.has(String(user._id)),
  }));
}

// Searches every member account (not only friends) by name, handle, Job profile headline or skill.
export async function searchMembers(viewerId, query) {
  const pattern = new RegExp(escapeRegex(query), 'i');
  const profileMatches = await JobProfile.find({ $or: [{ headline: pattern }, { skills: pattern }] }).select('user').limit(SEARCH_LIMIT).lean();
  const users = await User.find({
    _id: { $ne: viewerId },
    role: { $ne: 'admin' },
    $or: [{ name: pattern }, { handle: pattern }, { _id: { $in: profileMatches.map((match) => match.user) } }],
  })
    .sort({ name: 1 })
    .limit(SEARCH_LIMIT)
    .select(MEMBER_CARD_FIELDS)
    .lean();
  return toMemberCards(viewerId, users);
}
