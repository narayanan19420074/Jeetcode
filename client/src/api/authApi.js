import { apiClient } from './apiClient';

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  refresh: () => apiClient.post('/auth/refresh'),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),

  // OAuth — Google sends a ready-made ID token (from Google Identity
  // Services on the frontend). GitHub/LinkedIn send the one-time
  // authorization `code` from their redirect-based consent flow.
  googleSignIn: (idToken) => apiClient.post('/auth/google', { idToken }),
  githubSignIn: (code) => apiClient.post('/auth/github', { code }),
  linkedinSignIn: (code, redirectUri) => apiClient.post('/auth/linkedin', { code, redirectUri }),
  forgotPassword: (email, turnstileToken) => apiClient.post('/auth/forgot-password', { email, turnstileToken }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  resetPasswordWithCode: (email, code, password) => apiClient.post('/auth/reset-password-code', { email, code, password }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  resendVerification: () => apiClient.post('/auth/resend-verification'),
  adminLogin: (payload) => apiClient.post('/auth/admin-login', payload),
};
