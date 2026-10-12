import mongoose from 'mongoose';

// Slack-style channel messages for a study plan. Solve / join events are NOT stored —
// they are derived from real data when the feed is built.
const planMessageSchema = new mongoose.Schema(
  {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['message', 'nudge'], default: 'message' },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // set for nudges
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

planMessageSchema.index({ plan: 1, createdAt: -1 });
planMessageSchema.index({ plan: 1, user: 1, kind: 1, target: 1, createdAt: -1 });

export const PlanMessage = mongoose.model('PlanMessage', planMessageSchema);
