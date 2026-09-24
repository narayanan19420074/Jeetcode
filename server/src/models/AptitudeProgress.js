import mongoose from 'mongoose';

// One doc per (user, pattern). `unlocked` is written ONLY by
// aptitude.service.js after a test-mode submission is graded — never
// trust a client-sent unlocked flag, same principle as Problem hiding
// its answer key.
const aptitudeProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudePattern', required: true, index: true },

    bestScore: { type: Number, default: 0 }, // percentage, 0-100, best TEST-mode score
    attemptsCount: { type: Number, default: 0 },
    unlocked: { type: Boolean, default: false },

    // Set true either by aptitude.service.js#markLearnCompleted (legacy
    // "Mark as Learned" button) OR auto-flipped by markSubsectionComplete
    // once every Learn subsection has been completed. Gates Practice/Test
    // start (assertLearnCompleted).
    learnCompleted: { type: Boolean, default: false },

    // NEW — free-form subsection IDs completed by the user on
    // LearnTopicPage. IDs come from the frontend content file (e.g.
    // 'equation-based-questions', 'average-speed-trap'). Auto-flips
    // learnCompleted when length >= totalSubsections passed by the client.
    completedSubsections: { type: [String], default: [] },

    lastAttemptAt: { type: Date },
  },
  { timestamps: true }
);

// One progress doc per user per pattern; also the lookup used to build
// the home page's per-card progress %.
aptitudeProgressSchema.index({ user: 1, pattern: 1 }, { unique: true });

export const AptitudeProgress = mongoose.model('AptitudeProgress', aptitudeProgressSchema);