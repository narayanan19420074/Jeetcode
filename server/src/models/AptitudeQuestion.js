import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({ text: { type: String, required: true } }, { _id: false });

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudePattern', required: true, index: true },
    questionText: { type: String, required: true },

    options: {
      type: [optionSchema],
      validate: { validator: (v) => v.length === 4, message: 'A question needs exactly 4 options' },
    },
    correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: '' },

    // Exam-time trick shown AFTER the learner answers (practice / test review).
    // Hidden from publicProjection() like the answer key.
    shortcut: { type: String, default: '' },

    // Sub-pattern slug from AptitudePattern.subPatterns (e.g.
    // 'successive-percentage-change'). Drives practice filters, the hub's
    // mastery map and the results breakdown.
    subPattern: { type: String, default: '', index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    examStyles: { type: [String], default: [] },

    // Shared stimulus (table / passage / chart) — key into AptitudeSet for
    // the same pattern. null for ordinary stand-alone questions.
    setId: { type: String, default: null },

    // Denormalized global counters (LeetCode-style "acceptance rate").
    // Incremented by practice checks only; never trusted for grading.
    attemptsCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },

    // Stable identity (sha1 of the normalized question text) so re-running the
    // seed UPDATES questions in place and learners' practice progress survives.
    contentKey: { type: String, default: '' },

    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

aptitudeQuestionSchema.index({ pattern: 1, order: 1 });
aptitudeQuestionSchema.index({ pattern: 1, subPattern: 1, difficulty: 1 });
aptitudeQuestionSchema.index({ pattern: 1, contentKey: 1 });

// Same anti-cheat principle as Problem.publicProjection(): the correct
// answer index, explanation and shortcut must never reach the client before
// the question is graded server-side (aptitude.service.js).
aptitudeQuestionSchema.statics.publicProjection = function () {
  return '-correctOptionIndex -explanation -shortcut -attemptsCount -correctCount -examStyles -contentKey -createdBy -__v';
};

export const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
