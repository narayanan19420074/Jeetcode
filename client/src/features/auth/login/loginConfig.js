// These env vars must exist in client/.env. The GitHub redirect URI must EXACTLY
// match what is registered in GitHub's app settings (trailing slashes matter).
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
export const GITHUB_REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

// GitHub has no client SDK: sign in is a plain redirect to GitHub's consent screen.
export function startGithubSignIn() {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  url.searchParams.set('scope', 'read:user user:email');
  window.location.href = url.toString();
}
