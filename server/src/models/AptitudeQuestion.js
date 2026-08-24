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

    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

aptitudeQuestionSchema.index({ pattern: 1, order: 1 });

// Same anti-cheat principle as Problem.publicProjection(): the correct
// answer index and explanation must never reach the client before the
// question is graded server-side (aptitude.service.js).
aptitudeQuestionSchema.statics.publicProjection = function () {
  return '-correctOptionIndex -explanation -__v';
};

export const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
