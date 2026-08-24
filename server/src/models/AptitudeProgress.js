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
      lastAttemptAt: { type: Date },
    },
    { timestamps: true }
  );

  // One progress doc per user per pattern; also the lookup used to build
  // the home page's per-card progress %.
  aptitudeProgressSchema.index({ user: 1, pattern: 1 }, { unique: true });

  export const AptitudeProgress = mongoose.model('AptitudeProgress', aptitudeProgressSchema);
