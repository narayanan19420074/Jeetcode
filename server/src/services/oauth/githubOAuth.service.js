import { env } from '../../config/env.js';

/**
 * GitHub uses the OAuth "authorization code" flow, not an ID token like
 * Google. The frontend redirects the user to GitHub, GitHub redirects back
 * with a one-time `code`, and THIS function exchanges that code (server-side,
 * using our client secret) for an access token — then uses that token to
 * fetch the user's profile from GitHub's API.
 *
 * Returns the same shape as verifyGoogleIdToken() so oauth.controller.js
 * can treat every provider identically: {githubId, email, name, avatarUrl}.
 */
export async function exchangeGithubCode(code) {
  // Step 1: exchange the one-time code for an access token.
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    throw new Error(tokenData.error_description || 'GitHub token exchange failed');
  }
  const accessToken = tokenData.access_token;

  // Step 2: fetch the GitHub profile (name, avatar, id).
  const profileRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!profileRes.ok) throw new Error('Failed to fetch GitHub profile');
  const profile = await profileRes.json();

  // Step 3: GitHub's /user.email is often null (user has it set private).
  // The /user/emails endpoint requires the `user:email` scope but returns
  // the real (possibly private) address list — we pick the verified
  // primary one. Falls back to profile.email if that call ever fails.
  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      const primary = emails.find((e) => e.primary && e.verified);
      const anyVerified = emails.find((e) => e.verified);
      email = primary?.email || anyVerified?.email || null;
    }
  }

  if (!email) {
    throw new Error('Could not retrieve a verified email from GitHub. Please make an email public or verified on GitHub.');
  }

  return {
    githubId: String(profile.id),
    email,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url || null,
  };
}
