import { CommunityImage } from '../models/CommunityImage.js';
import { ApiError } from '../utils/ApiError.js';
import { markImagesAttached } from './communityImage.service.js';

// A banner must be a picture the member uploaded themselves, so a profile cannot show or later delete someone else's
// image. Attaching it keeps it from expiring like an abandoned upload.
export async function claimBannerImage(userId, imageId) {
  if (!imageId) return;
  if (!(await CommunityImage.exists({ _id: imageId, owner: userId }))) throw ApiError.badRequest('Banner image not found');
  await markImagesAttached([imageId]);
}

// A replaced or removed banner is deleted, so old pictures do not pile up in the database.
export async function releaseBannerImage(userId, previousImageId, currentImageId) {
  if (!previousImageId || previousImageId === currentImageId) return;
  await CommunityImage.deleteOne({ _id: previousImageId, owner: userId });
}
