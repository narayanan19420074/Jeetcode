import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },
    selectedOption: { type: Number, min: 0, max: 3, default: null },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudePattern', required: true, index: true },
    mode: { type: String, enum: ['test', 'practice'], required: true },
    status: { type: String, enum: ['in-progress', 'completed', 'expired'], default: 'in-progress', index: true },

    // Test-mode timer is enforced HERE, server-side. startAttempt() sets
    // expiresAt = now + pattern.timeLimitMinutes at creation — a client
    // fiddling with its own clock can't extend it. submitAttempt() rejects
    // (or force-grades with whatever answers exist) once past expiresAt.
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // test mode only, null for practice
    submittedAt: { type: Date },

    answers: [answerSchema],

    score: { type: Number }, // percentage, set on submit
    correctCount: { type: Number, default: 0 },
    totalCount: { type: Number, required: true },
    timeTakenSec: { type: Number },
  },
  { timestamps: true }
);

aptitudeAttemptSchema.index({ user: 1, pattern: 1, createdAt: -1 });

export const AptitudeAttempt = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema);
