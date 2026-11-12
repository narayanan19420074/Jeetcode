import mongoose from 'mongoose';
import { JobProfile } from '../models/JobProfile.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const EMPTY_JOB_PROFILE = {
  headline: '',
  about: '',
  openToWork: false,
  experience: [],
  education: [],
  certifications: [],
  skills: [],
};

// Only the profile content leaves the server: no ids, owner reference or version key.
const PROFILE_PROJECTION = `${Object.keys(EMPTY_JOB_PROFILE).join(' ')} -_id`;

export async function getJobProfile(userId) {
  const profile = await JobProfile.findOne({ user: userId }).select(PROFILE_PROJECTION).lean();
  return profile ?? EMPTY_JOB_PROFILE;
}

// What another signed-in member sees: the account's public identity plus the profile content. Private account
// data (email, coins, progress) is never selected.
export async function getMemberJobProfile(userId) {
  if (!mongoose.isValidObjectId(userId)) throw ApiError.notFound('Profile not found');
  const user = await User.findById(userId).select('name handle avatarUrl location').lean();
  if (!user) throw ApiError.notFound('Profile not found');
  return { user, profile: await getJobProfile(userId) };
}

// The first save creates the document, so a new user never needs a separate "create" step.
export async function saveJobProfile(userId, content) {
  await JobProfile.findOneAndUpdate({ user: userId }, { $set: content }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  return getJobProfile(userId);
}

// Called when an account is deleted so no personal career data is left behind.
export const deleteJobProfile = (userId) => JobProfile.deleteOne({ user: userId });
