import mongoose from 'mongoose';
import { JobProfile } from '../models/JobProfile.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { findFollowedUserIds } from './communityFollow.service.js';
import { claimBannerImage, releaseBannerImage } from './jobProfileBanner.service.js';

export const EMPTY_JOB_PROFILE = {
  headline: '',
  about: '',
  openToWork: false,
  hiring: false,
  bannerImage: '',
  experience: [],
  education: [],
  certifications: [],
  skills: [],
};

// Only the profile content leaves the server: no ids, owner reference or version key.
const PROFILE_PROJECTION = `${Object.keys(EMPTY_JOB_PROFILE).join(' ')} -_id`;

export async function getJobProfile(userId) {
  const profile = await JobProfile.findOne({ user: userId }).select(PROFILE_PROJECTION).lean();
  // Profiles saved before a field existed come back without it, so the missing fields are filled from the blank profile.
  return { ...EMPTY_JOB_PROFILE, ...profile };
}

// What another signed-in member sees: the account's public identity, the profile content and whether the viewer already
// follows them. Private account data (email, coins, progress) is never selected.
export async function getMemberJobProfile(userId, viewerId) {
  if (!mongoose.isValidObjectId(userId)) throw ApiError.notFound('Profile not found');
  const user = await User.findById(userId).select('name handle avatarUrl location').lean();
  if (!user) throw ApiError.notFound('Profile not found');
  const [profile, followed] = await Promise.all([getJobProfile(userId), findFollowedUserIds(viewerId, [userId])]);
  return { user, profile, isFollowing: followed.has(String(userId)) };
}

// The first save creates the document, so a new user never needs a separate "create" step.
export async function saveJobProfile(userId, content) {
  const previous = await JobProfile.findOne({ user: userId }).select('bannerImage').lean();
  await claimBannerImage(userId, content.bannerImage);
  await JobProfile.findOneAndUpdate({ user: userId }, { $set: content }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  await releaseBannerImage(userId, previous?.bannerImage, content.bannerImage);
  return getJobProfile(userId);
}

// Called when an account is deleted so no personal career data (or banner picture) is left behind.
export async function deleteJobProfile(userId) {
  const profile = await JobProfile.findOneAndDelete({ user: userId }).select('bannerImage').lean();
  await releaseBannerImage(userId, profile?.bannerImage, '');
}
