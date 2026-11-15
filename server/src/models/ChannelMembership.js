import mongoose from 'mongoose';

// One document per (channel, user). The unique pair index makes joining and subscribing idempotent.
const channelMembershipSchema = new mongoose.Schema(
  {
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityChannel', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

channelMembershipSchema.index({ channel: 1, user: 1 }, { unique: true });
channelMembershipSchema.index({ user: 1, createdAt: -1 });

export const ChannelMembership = mongoose.model('ChannelMembership', channelMembershipSchema);
