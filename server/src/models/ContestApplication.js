import mongoose from 'mongoose';

// One row per person who applied to a contest. The unique index makes double-applying impossible
// (and makes the applicant count a plain count).
const contestApplicationSchema = new mongoose.Schema(
  {
    contest: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rulesVersion: { type: Number, required: true }, // the rules this person accepted
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

contestApplicationSchema.index({ contest: 1, user: 1 }, { unique: true });

export const ContestApplication = mongoose.model('ContestApplication', contestApplicationSchema);
