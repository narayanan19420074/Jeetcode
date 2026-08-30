import { apiClient } from './apiClient';

export const usersApi = {
  activity: () => apiClient.get('/users/me/activity'),
  toggleBookmark: (problemId) => apiClient.post(`/users/me/bookmarks/${problemId}`),
  updateProfile: (payload) => apiClient.patch('/users/me/profile', payload),
  changePassword: (payload) => apiClient.patch('/users/me/password', payload),
};
