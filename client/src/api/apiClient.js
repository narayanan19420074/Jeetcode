import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie
});

// The access token lives in memory only (set by authSlice after
// login/refresh) — never localStorage. Losing it on a hard refresh is
// intentional; main.jsx calls /auth/refresh on boot to silently restore
// the session from the httpOnly cookie instead.
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// If a request fails with 401 (expired access token), try exactly once to
// refresh via the cookie-based endpoint, then replay the original
// request. Prevents every component from having to handle token expiry
// itself.
let refreshPromise = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = apiClient.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch {
        setAccessToken(null);
        // Let the caller (authSlice thunks) handle redirecting to /login.
      }
    }
    return Promise.reject(error);
  }
);

// Every backend error follows { success: false, message } — this pulls
// that out so thunks/components can show one consistent message.
export function extractErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
}
