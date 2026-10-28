import axios from 'axios';
import { env } from '../config/env.js';

// Cloudflare Turnstile server-side verification.
// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const turnstileEnabled = () => Boolean(env.TURNSTILE_SECRET_KEY);

/**
 * Returns true when Cloudflare confirms the token. Returns false for an invalid, expired or
 * already-used token. Throws when Cloudflare itself cannot be reached.
 */
export async function verifyTurnstileToken(token, remoteIp) {
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  const { data } = await axios.post(VERIFY_URL, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 5000,
  });
  return data?.success === true;
}
