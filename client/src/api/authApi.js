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
};
