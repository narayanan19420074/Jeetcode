import mongoose from 'mongoose';

// One full mock paper. Sections run on their OWN clocks (like TCS iON /
// Infosys): `currentSection` + `sectionEndsAt` are enforced server-side, and a
// finished section can never be reopened. Pattern + difficulty are copied onto
// each answer at start so results never need a second lookup.
const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },
    section: { type: Number, required: true },
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudePattern', required: true },
    difficulty: { type: String, default: 'medium' },
    selectedOption: { type: Number, min: 0, max: 3, default: null },
    isCorrect: { type: Boolean, default: null },
    visited: { type: Boolean, default: false },
    markedForReview: { type: Boolean, default: false },
    timeSpentSec: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    durationSec: { type: Number, required: true },
    total: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
  },
  { _id: false }
);

const mockAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paperId: { type: String, required: true, index: true },
    paperTitle: { type: String, required: true },
    status: { type: String, enum: ['in-progress', 'completed', 'expired'], default: 'in-progress', index: true },

    sections: [sectionSchema],
    currentSection: { type: Number, default: 0 },
    sectionEndsAt: { type: Date, required: true },

    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // end of the LAST section if never submitted early
    submittedAt: { type: Date },

    answers: [answerSchema],

    score: { type: Number }, // percentage
    correctCount: { type: Number, default: 0 },
    totalCount: { type: Number, required: true },
    timeTakenSec: { type: Number },
  },
  { timestamps: true }
);

mockAttemptSchema.index({ user: 1, paperId: 1, createdAt: -1 });
mockAttemptSchema.index({ paperId: 1, status: 1, score: 1 });

export const MockAttempt = mongoose.model('MockAttempt', mockAttemptSchema);
