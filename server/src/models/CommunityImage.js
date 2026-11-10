import mongoose from 'mongoose';
import { IMAGE_CONTENT_TYPES, UNATTACHED_IMAGE_TTL_SECONDS } from '../config/communityImages.js';

// One uploaded post image. `attached` turns true when a post that references it is published; until then the
// document expires on its own (see the TTL index) so abandoned uploads never fill the database.
const communityImageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentType: { type: String, enum: IMAGE_CONTENT_TYPES, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
    attached: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

communityImageSchema.index({ createdAt: 1 }, { expireAfterSeconds: UNATTACHED_IMAGE_TTL_SECONDS, partialFilterExpression: { attached: false } });

export const CommunityImage = mongoose.model('CommunityImage', communityImageSchema);
