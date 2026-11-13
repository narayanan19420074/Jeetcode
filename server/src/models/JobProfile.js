import mongoose from 'mongoose';
import { EMPLOYMENT_TYPES, JOB_PROFILE_LIMITS as LIMITS, MONTH_PATTERN, WORK_MODES } from '../config/jobProfile.js';

const text = (maxlength, required = false) => ({ type: String, trim: true, maxlength, required, default: required ? undefined : '' });
const month = (required = false) => ({ type: String, match: MONTH_PATTERN, required, default: required ? undefined : '' });
const choice = (values) => ({ type: String, enum: ['', ...values], default: '' });

const experienceSchema = new mongoose.Schema(
  {
    title: text(LIMITS.shortText, true),
    company: text(LIMITS.shortText, true),
    employmentType: choice(EMPLOYMENT_TYPES),
    location: text(LIMITS.shortText),
    workMode: choice(WORK_MODES),
    startDate: month(true),
    endDate: month(),
    isCurrent: { type: Boolean, default: false },
    description: text(LIMITS.description),
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: text(LIMITS.shortText, true),
    degree: text(LIMITS.shortText),
    fieldOfStudy: text(LIMITS.shortText),
    startDate: month(),
    endDate: month(),
    grade: text(LIMITS.grade),
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: text(LIMITS.shortText, true),
    issuer: text(LIMITS.shortText, true),
    issueDate: month(),
    expiryDate: month(),
    credentialId: text(LIMITS.credentialId),
    credentialUrl: text(LIMITS.credentialUrl),
  },
  { _id: false }
);

// One document per user. It is kept apart from the User document so the account payload that is
// loaded on nearly every request stays small.
const jobProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: text(LIMITS.headline),
    about: text(LIMITS.about),
    openToWork: { type: Boolean, default: false },
    hiring: { type: Boolean, default: false },
    // Id of the uploaded banner picture (a CommunityImage owned by this user); empty means the default gradient banner.
    bannerImage: { type: String, default: '', match: /^([a-f\d]{24})?$/i },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    skills: { type: [{ type: String, trim: true, maxlength: LIMITS.skillName }], default: [] },
  },
  { timestamps: true }
);

export const JobProfile = mongoose.model('JobProfile', jobProfileSchema);
