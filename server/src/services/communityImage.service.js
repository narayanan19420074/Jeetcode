import { CommunityImage } from '../models/CommunityImage.js';
import { ApiError } from '../utils/ApiError.js';
import { toObjectId } from './community.service.js';
import { IMAGE_REFERENCE, MAX_PENDING_IMAGES_PER_USER } from '../config/communityImages.js';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// The file content decides the type, never the request header, so a renamed file cannot be served as an image.
const SIGNATURES = [
  { type: 'image/jpeg', matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { type: 'image/png', matches: (bytes) => PNG_SIGNATURE.every((byte, index) => bytes[index] === byte) },
  { type: 'image/webp', matches: (bytes) => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' },
];

export const detectImageType = (bytes) => SIGNATURES.find(({ matches }) => matches(bytes))?.type ?? null;

export async function saveImage(userId, bytes) {
  const contentType = Buffer.isBuffer(bytes) ? detectImageType(bytes) : null;
  if (!contentType) throw ApiError.badRequest('Only JPEG, PNG and WebP images are supported.');
  const pending = await CommunityImage.countDocuments({ owner: userId, attached: false });
  if (pending >= MAX_PENDING_IMAGES_PER_USER) throw ApiError.tooMany('Publish or remove your uploaded images before adding more.');
  const image = await CommunityImage.create({ owner: userId, contentType, data: bytes, size: bytes.length });
  return { id: image._id };
}

export async function loadImage(id) {
  const image = await CommunityImage.findById(toObjectId(id, 'Image')).select('contentType data');
  if (!image) throw ApiError.notFound('Image not found');
  return image;
}

const extractImageIds = (body) => [...new Set([...body.matchAll(IMAGE_REFERENCE)].map((match) => match[1].toLowerCase()))];

// Only images the author uploaded can be attached to their post, in the order they appear in the text. This stops
// a post from claiming (or later deleting) someone else's image.
export async function findOwnedImageIds(userId, body) {
  const ids = extractImageIds(body);
  if (!ids.length) return [];
  const owned = await CommunityImage.find({ _id: { $in: ids }, owner: userId }).select('_id').lean();
  const ownedIds = new Set(owned.map((image) => String(image._id)));
  return ids.filter((id) => ownedIds.has(id));
}

export async function markImagesAttached(ids) {
  if (ids.length) await CommunityImage.updateMany({ _id: { $in: ids } }, { attached: true });
}

export async function deleteImagesOfPost(post) {
  const ids = await findOwnedImageIds(post.author?._id || post.author, post.body || '');
  if (ids.length) await CommunityImage.deleteMany({ _id: { $in: ids } });
}
