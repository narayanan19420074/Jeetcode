import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashToken } from '../services/authToken.service.js';
import { logSecurityEvent } from '../services/securityLog.service.js';
import { sendVerificationEmail, sendPasswordResetEmail, mailConfigured } from '../services/mail.service.js';

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000; // minimum gap between two emails to the same account

const newToken = () => crypto.randomBytes(32).toString('hex');

// Creates a verification token for `user` and emails it. Returns true if mail went out.
// Used by register (fire and forget) and by resend-verification.
export async function issueVerificationEmail(user) {
  const token = newToken();
  const now = Date.now();
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerifyTokenHash: hashToken(token),
        emailVerifyExpiresAt: new Date(now + VERIFY_TTL_MS),
        emailVerifySentAt: new Date(now),
      },
    }
  );
  return sendVerificationEmail(user, token);
}

// POST /api/auth/forgot-password — body: { email }.
// Always answers the same way so nobody can use this to find out which emails are registered.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+passwordResetSentAt');

  if (user) {
    const last = user.passwordResetSentAt?.getTime() || 0;
    if (Date.now() - last > COOLDOWN_MS) {
      const token = newToken();
      const now = Date.now();
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetTokenHash: hashToken(token),
            passwordResetExpiresAt: new Date(now + RESET_TTL_MS),
            passwordResetSentAt: new Date(now),
          },
        }
      );
      await logSecurityEvent(user._id, req, 'password_reset_requested');
      // Not awaited: response time must not reveal whether the account exists.
      sendPasswordResetEmail(user, token).catch(() => {});
    }
  }

  new ApiResponse(200, null, 'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.').send(res);
});

// POST /api/auth/reset-password — body: { token, password }.
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('_id');
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired. Request a new one.');

  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash,
        emailVerified: true, // they just proved they own this inbox
        refreshSessions: [], // sign out every device
        refreshTokenHash: null,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    }
  );
  await logSecurityEvent(user._id, req, 'password_reset', 'Password reset by email link; all sessions signed out');

  new ApiResponse(200, null, 'Password updated. You can now sign in.').send(res);
});

// POST /api/auth/verify-email — body: { token }.
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerifyTokenHash: hashToken(req.body.token),
    emailVerifyExpiresAt: { $gt: new Date() },
  }).select('_id');
  if (!user) throw ApiError.badRequest('Verification link is invalid or has expired. Request a new one from the app.');

  await User.updateOne(
    { _id: user._id },
    { $set: { emailVerified: true, emailVerifyTokenHash: null, emailVerifyExpiresAt: null } }
  );
  await logSecurityEvent(user._id, req, 'email_verified');

  new ApiResponse(200, { emailVerified: true }, 'Email verified').send(res);
});

// POST /api/auth/resend-verification — logged-in users.
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.fullUser._id).select('+emailVerifySentAt');
  if (user.isEmailVerified()) {
    return new ApiResponse(200, { emailVerified: true }, 'Email already verified').send(res);
  }

  const last = user.emailVerifySentAt?.getTime() || 0;
  const wait = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
  if (wait > 0) throw ApiError.tooMany(`Wait ${wait}s before asking for another email.`);

  if (!mailConfigured()) throw new ApiError(503, 'Email service is not set up yet. Please try again later.');
  const sent = await issueVerificationEmail(user);
  if (!sent) throw new ApiError(502, 'Could not send the email right now. Please try again in a minute.');

  new ApiResponse(200, null, 'Verification email sent. Please check your inbox and spam folder.').send(res);
});
