import mongoose from 'mongoose';

// Help & Support form submissions (bug reports, feature requests, payment issues, questions).
// Guests can submit too, so `user` is optional and `email` is always stored for replying.
export const FEEDBACK_TYPES = ['bug', 'feature', 'question', 'payment', 'account', 'other'];
export const FEEDBACK_STATUSES = ['open', 'in-progress', 'resolved'];

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, trim: true, maxlength: 80, default: '' },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, required: true },
    type: { type: String, enum: FEEDBACK_TYPES, default: 'question', index: true },
    subject: { type: String, trim: true, maxlength: 120, default: '' },
    message: { type: String, trim: true, minlength: 10, maxlength: 3000, required: true },
    pageUrl: { type: String, trim: true, maxlength: 300, default: '' },
    userAgent: { type: String, maxlength: 300, default: '' },
    status: { type: String, enum: FEEDBACK_STATUSES, default: 'open', index: true },
    adminNote: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
