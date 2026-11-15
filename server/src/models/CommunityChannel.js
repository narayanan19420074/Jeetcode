import mongoose from 'mongoose';

export const CHANNEL_KINDS = ['group', 'newsletter'];

// A Group (members discuss together) or a Newsletter (one owner publishes, subscribers read). Both share one model
// because they differ only in who may publish. `memberCount` counts members or subscribers and is kept in step with
// ChannelMembership by the channel service, so lists never need a count query per row.
// `nameKey` is the lower-case name: it keeps names unique within a kind regardless of capitalisation.
const communityChannelSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: CHANNEL_KINDS, required: true },
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    nameKey: { type: String, required: true },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

communityChannelSchema.index({ kind: 1, nameKey: 1 }, { unique: true });
communityChannelSchema.index({ kind: 1, memberCount: -1, createdAt: -1 });

export const CommunityChannel = mongoose.model('CommunityChannel', communityChannelSchema);
