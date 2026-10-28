import mongoose from 'mongoose';

// One message in a SupportChat. `user` is always the chat owner (customer), which makes
// deleting everything for an account a single query. `author` is set for agent messages.
const supportMessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportChat', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: String, enum: ['user', 'agent'], required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

supportMessageSchema.index({ chat: 1, createdAt: 1 });

export const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);
