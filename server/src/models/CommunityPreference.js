import mongoose from 'mongoose';

const objectIdList = [{ type: mongoose.Schema.Types.ObjectId }];

// Private feed choices of one user: posts they saved, posts they are not interested in and authors they hid.
// Lists are capped by the engagement service so one account cannot grow a document without limit.
const communityPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    savedPosts: objectIdList,
    hiddenPosts: objectIdList,
    mutedAuthors: objectIdList,
  },
  { timestamps: true }
);

export const CommunityPreference = mongoose.model('CommunityPreference', communityPreferenceSchema);
