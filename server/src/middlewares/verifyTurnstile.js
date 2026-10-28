import { env, isProd } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { verifyTurnstileToken } from '../services/turnstile.service.js';

let warned = false;

// Bot protection for sign-in, sign-up and password-reset requests.
// Active only when TURNSTILE_SECRET_KEY is set, so local development works without keys.
// Place AFTER validate(...) so the body shape is already checked.
export const verifyTurnstile = asyncHandler(async (req, res, next) => {
  if (!env.TURNSTILE_SECRET_KEY) {
    if (isProd && !warned) {
      warned = true;
      logger.warn('TURNSTILE_SECRET_KEY is not set: bot verification is disabled on auth routes.');
    }
    return next();
  }

  const token = req.body?.turnstileToken;
  delete req.body?.turnstileToken; // never let it travel further than this middleware
  if (!token) throw ApiError.badRequest('Please complete the verification check.');

  let ok;
  try {
    ok = await verifyTurnstileToken(token, req.ip);
  } catch (err) {
    logger.error('Turnstile verification request failed', err);
    throw new ApiError(503, 'Verification is temporarily unavailable. Please try again in a moment.');
  }
  if (!ok) throw ApiError.badRequest('Verification failed. Please try again.');
  next();
});
