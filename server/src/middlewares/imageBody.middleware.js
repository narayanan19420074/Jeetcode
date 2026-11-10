import express from 'express';
import { ApiError } from '../utils/ApiError.js';
import { IMAGE_CONTENT_TYPES, MAX_IMAGE_BYTES } from '../config/communityImages.js';

const readRawImage = express.raw({ type: IMAGE_CONTENT_TYPES, limit: MAX_IMAGE_BYTES });
const MAX_IMAGE_MEGABYTES = MAX_IMAGE_BYTES / (1024 * 1024);

// The body parser throws plain errors, which the error handler would report as a server failure. Map them so the
// person sees what to fix instead.
export function readImageBody(req, res, next) {
  readRawImage(req, res, (err) => {
    if (!err) return next();
    if (err.type === 'entity.too.large') return next(new ApiError(413, `The image is too large. Choose one under ${MAX_IMAGE_MEGABYTES} MB.`));
    return next(ApiError.badRequest('The image could not be read.'));
  });
}
