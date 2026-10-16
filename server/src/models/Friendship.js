import mongoose from 'mongoose';

// One document per pair of users. `pairKey` (the two ids sorted and joined) makes the pair
// unique no matter who asked first, so "A→B" and "B→A" can never both exist.
//   pending  = requester asked, recipient has not answered yet
//   accepted = they are friends (shown everywhere: dashboard, leaderboard, ...)
const friendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pairKey: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

export const Friendship = mongoose.model('Friendship', friendshipSchema);
