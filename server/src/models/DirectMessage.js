import mongoose from 'mongoose';

// One document per chat message between two members.
//   text  = a normal typed message
//   room  = "come code with me" invite (roomId points at a live pair-coding room)
//   nudge = "keep your streak alive" reminder
// `pairKey` is the same sorted id pair Friendship uses, so a whole conversation is one indexed query.
const directMessageSchema = new mongoose.Schema(
  {
    pairKey: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['text', 'room', 'nudge'], default: 'text' },
    text: { type: String, default: '', maxlength: 1000 },
    roomId: { type: String, default: null },
    roomTitle: { type: String, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Conversation history, newest first.
directMessageSchema.index({ pairKey: 1, createdAt: -1 });
// The inbox: "the newest message of every conversation I am part of", whether I sent or received it.
directMessageSchema.index({ from: 1, createdAt: -1 });
// Unread badge: "everything sent to me that I have not opened".
directMessageSchema.index({ to: 1, readAt: 1, from: 1 });

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
