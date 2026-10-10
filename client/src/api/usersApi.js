import { apiClient } from './apiClient';

export const usersApi = {
  activity: () => apiClient.get('/users/me/activity'),
  toggleBookmark: (problemId) => apiClient.post(`/users/me/bookmarks/${problemId}`),

  // Settings
  updateProfile: (payload) => apiClient.patch('/users/me/profile', payload),
  updatePreferences: (payload) => apiClient.patch('/users/me/preferences', payload),
  changePassword: (payload) => apiClient.patch('/users/me/password', payload),
  changeHandle: (handle) => apiClient.patch('/users/me/handle', { handle }),
  account: () => apiClient.get('/users/me/account'),
  securityLog: () => apiClient.get('/users/me/security-log'),
  exportData: () => apiClient.get('/users/me/export', { responseType: 'blob' }),
  deleteAccount: (payload) => apiClient.post('/users/me/delete', payload),

  // Sessions live under /auth so the path-scoped refresh cookie is sent
  // (that is how the server knows which one is "this device").
  sessions: () => apiClient.get('/auth/sessions'),
  revokeSession: (id) => apiClient.delete(`/auth/sessions/${id}`),
  revokeOtherSessions: () => apiClient.delete('/auth/sessions'),
};
