import { JobProfile } from '../models/JobProfile.js';

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

// The first save creates the document, so a new user never needs a separate "create" step.
export async function saveJobProfile(userId, content) {
  await JobProfile.findOneAndUpdate({ user: userId }, { $set: content }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  return getJobProfile(userId);
}

// Called when an account is deleted so no personal career data is left behind.
export const deleteJobProfile = (userId) => JobProfile.deleteOne({ user: userId });
