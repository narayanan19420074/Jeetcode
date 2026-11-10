import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loadImage, saveImage } from '../services/communityImage.service.js';

// POST /community/images (raw image bytes)
export const uploadImage = asyncHandler(async (req, res) => {
  const { id } = await saveImage(req.user.id, req.body);
  new ApiResponse(201, { id }, 'Image uploaded').send(res);
});

// GET /community/images/:id. An image never changes after upload, so browsers may keep it for good. Posts are public,
// so images are too; the cross-origin header lets the development client (another port) display them.
export const serveImage = asyncHandler(async (req, res) => {
  const image = await loadImage(req.params.id);
  res.set({
    'Content-Type': image.contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.send(image.data);
});
