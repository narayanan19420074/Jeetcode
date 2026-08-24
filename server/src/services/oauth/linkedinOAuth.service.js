import { env } from '../../config/env.js';

/**
 * LinkedIn uses "Sign In with LinkedIn using OpenID Connect" — an
 * authorization-code flow like GitHub's, but the final profile comes from
 * a standard OIDC /userinfo endpoint instead of a custom REST API. LinkedIn
 * requires this specific product to be added + approved on the LinkedIn App
 * before r_liteprofile/openid scopes work (see WIRING.md setup section).
 *
 * Returns the same shape as the other providers:
 * {linkedinId, email, name, avatarUrl}.
 */
export async function exchangeLinkedinCode(code, redirectUri) {
  // Step 1: exchange the one-time code for an access token.
  // LinkedIn's token endpoint wants application/x-www-form-urlencoded,
  // not JSON (unlike GitHub, which accepts either).
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri, // must exactly match the URI used in the initial auth redirect
    client_id: env.LINKEDIN_CLIENT_ID,
    client_secret: env.LINKEDIN_CLIENT_SECRET,
  });

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || 'LinkedIn token exchange failed');
  }

  // Step 2: fetch the OIDC userinfo — LinkedIn's OpenID Connect standard
  // endpoint. Returns sub (their stable user id), email, name, picture,
  // and email_verified directly — no separate emails call needed (unlike
  // GitHub), because the openid+email scopes guarantee a verified email.
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) throw new Error('Failed to fetch LinkedIn profile');
  const profile = await userRes.json();

  if (!profile.email_verified) {
    throw new Error('LinkedIn account email is not verified');
  }

  return {
    linkedinId: profile.sub,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture || null,
  };
}
