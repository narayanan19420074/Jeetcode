import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google Identity Services ID token (sent by the frontend's
 * Google Sign-In button) and returns the profile fields we care about.
 * Throws if the token is invalid, expired, or was issued for a different
 * client id (audience mismatch — a token replayed from some other app).
 */
export async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatarUrl: payload.picture,
  };
}
