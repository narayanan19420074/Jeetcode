import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { issueTokens } from '../services/authToken.service.js';
import { findOrCreateOAuthUser } from '../services/oauth/oauthUser.service.js';
import { verifyGoogleIdToken } from '../services/oauth/googleOAuth.service.js';
import { exchangeGithubCode } from '../services/oauth/githubOAuth.service.js';
import { exchangeLinkedinCode } from '../services/oauth/linkedinOAuth.service.js';

// POST /api/auth/google — body: { idToken } (the credential string from
// Google Identity Services' button/One Tap on the frontend).
export const googleSignIn = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw ApiError.badRequest('idToken is required');

  let profile;
  try {
    profile = await verifyGoogleIdToken(idToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired Google token');
  }

  const user = await findOrCreateOAuthUser({
    providerField: 'googleId',
    providerId: profile.googleId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
  });

  const accessToken = await issueTokens(res, user);
  new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, 'Signed in with Google').send(res);
});

// POST /api/auth/github — body: { code } (the one-time authorization code
// GitHub redirected back to the frontend with, after the user approved the
// app on GitHub's consent screen).
export const githubSignIn = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw ApiError.badRequest('code is required');

  let profile;
  try {
    profile = await exchangeGithubCode(code);
  } catch (err) {
    throw ApiError.unauthorized(err.message || 'GitHub sign-in failed');
  }

  const user = await findOrCreateOAuthUser({
    providerField: 'githubId',
    providerId: profile.githubId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
  });

  const accessToken = await issueTokens(res, user);
  new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, 'Signed in with GitHub').send(res);
});

// POST /api/auth/linkedin — body: { code, redirectUri }. redirectUri must
// be the exact same URI the frontend used to open LinkedIn's consent
// screen (LinkedIn checks this on token exchange, unlike GitHub).
export const linkedinSignIn = asyncHandler(async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) throw ApiError.badRequest('code and redirectUri are required');

  let profile;
  try {
    profile = await exchangeLinkedinCode(code, redirectUri);
  } catch (err) {
    throw ApiError.unauthorized(err.message || 'LinkedIn sign-in failed');
  }

  const user = await findOrCreateOAuthUser({
    providerField: 'linkedinId',
    providerId: profile.linkedinId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
  });

  const accessToken = await issueTokens(res, user);
  new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, 'Signed in with LinkedIn').send(res);
});
