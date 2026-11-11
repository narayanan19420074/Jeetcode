import mongoose from 'mongoose';

// "<actor> added you to <plan>" or "<actor> invited you to <plan>" — shown in the notification bell of the top bar.
const planNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['added', 'invited'], default: 'added' },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

planNotificationSchema.index({ user: 1, createdAt: -1 });
// Old notifications clean themselves up after 30 days.
planNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const PlanNotification = mongoose.model('PlanNotification', planNotificationSchema);
