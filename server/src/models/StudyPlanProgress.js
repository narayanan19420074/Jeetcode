import mongoose from 'mongoose';

// Per (plan, user) manual ticks — only for 'custom' items. Coding / aptitude
// items are derived from real solve data and never stored here.
const studyPlanProgressSchema = new mongoose.Schema(
  {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doneItems: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

studyPlanProgressSchema.index({ plan: 1, user: 1 }, { unique: true });

export const StudyPlanProgress = mongoose.model('StudyPlanProgress', studyPlanProgressSchema);
