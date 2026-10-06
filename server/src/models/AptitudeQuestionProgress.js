import mongoose from 'mongoose';

// One doc per (user, question) — LeetCode-style "problem status". Written by
// the practice check endpoint; powers the practice list's status column, the
// hub's difficulty breakdown and the per-sub-pattern mastery map.
const aptitudeQuestionProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudePattern', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },

    // Denormalized so mastery stats never need a join.
    subPattern: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

    // 'attempted' = tried, never right yet. 'solved' sticks once correct.
    status: { type: String, enum: ['attempted', 'solved'], default: 'attempted' },
    attempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    lastSelectedOption: { type: Number, default: null },
    lastTimeSec: { type: Number, default: null },
    bestTimeSec: { type: Number, default: null },
    solvedAt: { type: Date, default: null },
    bookmarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

aptitudeQuestionProgressSchema.index({ user: 1, question: 1 }, { unique: true });
aptitudeQuestionProgressSchema.index({ user: 1, pattern: 1 });

export const AptitudeQuestionProgress = mongoose.model('AptitudeQuestionProgress', aptitudeQuestionProgressSchema);
