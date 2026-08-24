import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Deliberately NOT read from the JWT payload like requireAuth's req.user —
// Pro status changes async via Razorpay webhooks (renewal, cancellation,
// failed charge), so a token issued this morning could be stale by
// tonight. This does one extra DB read on Pro-gated routes only; every
// other route stays fast and untouched.
//
// Never throws — guests and non-Pro users just get hasProAccess=false,
// and the calling controller decides what to do with that (lock a list
// item vs. reject a detail fetch).
export const checkProAccess = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    req.hasProAccess = false;
    return next();
  }
  const user = await User.findById(req.user.id).select('isPro proExpiresAt');
  req.hasProAccess = Boolean(
    user?.isPro && (!user.proExpiresAt || user.proExpiresAt > new Date())
  );
  next();
});
