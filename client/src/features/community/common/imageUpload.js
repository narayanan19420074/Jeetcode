import { communityApi } from '../../../api/communityApi';
import { apiClient } from '../../../api/apiClient';
import { COLOR_PALETTE } from '../../../app/design/designTokens';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIDE = 1600;
const JPEG_QUALITY = 0.82;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // keep in sync with MAX_IMAGE_BYTES on the server

export const communityImageUrl = (id) => `${apiClient.defaults.baseURL}/community/images/${id}`;

export const canvasToJpeg = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The image could not be processed.'))), 'image/jpeg', JPEG_QUALITY);
  });

// Photos from a phone camera are several megabytes. Scaling them down and saving them as JPEG keeps uploads fast and
// the database small. Transparent areas of a PNG become white.
async function prepareImage(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error('Only JPEG, PNG and WebP images are supported.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  context.fillStyle = COLOR_PALETTE.white;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToJpeg(canvas);
}

export async function uploadImageFile(file) {
  return uploadImageBlob(await prepareImage(file));
}

// Used for images that are already JPEG, such as the result of the crop dialog.
export async function uploadImageBlob(blob) {
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('The image is too large. Choose a smaller one.');
  const { data } = await communityApi.uploadImage(blob);
  return { id: data.data.id };
}
