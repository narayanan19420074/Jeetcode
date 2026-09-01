import mongoose from 'mongoose';

// One doc per (user, company, section), created at enroll time. Practice
// counts for problem-filter sections are deliberately NOT denormalized
// here — they're computed on read from User.solvedProblems in
// prep.controller.js, since /prep is far lower-traffic than the
// dashboard and doesn't need the same avoid-aggregation treatment the
// rest of the app uses. testScore IS stored directly, since a test
// attempt is a discrete event with no other natural home to live in.
const userPrepProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'PrepCompany', required: true, index: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'PrepSection', required: true },

    // Snapshotted from PrepSection.recommendedTarget at enroll time, so a
    // later admin edit to the target doesn't retroactively change what
    // "100%" meant for a user already partway through.
    practiceTarget: { type: Number, default: 0 },

    testScore: { type: Number, default: null }, // 0-100, most recent attempt
    testAttemptedAt: { type: Date, default: null },

    // For 'external-only' sections (GFG/IndiaBix links etc.) — there is NO
    // way to measure activity on a site we don't control, so this is a
    // deliberate self-report checkbox, NOT a substitute for measured
    // progress. The API and UI both label this distinctly (never shown
    // with the same weak/moderate/strong badge measured sections get) so
    // it never masquerades as verified data.
    selfReported: { type: Boolean, default: false },

    stage: {
      type: String,
      enum: ['not-started', 'learning', 'practicing', 'tested'],
      default: 'not-started',
    },
    lastActivityAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userPrepProgressSchema.index({ user: 1, company: 1, section: 1 }, { unique: true });

export const UserPrepProgress = mongoose.model('UserPrepProgress', userPrepProgressSchema);
