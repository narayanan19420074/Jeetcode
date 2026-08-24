import { apiClient } from './apiClient';

export const usersApi = {
  activity: () => apiClient.get('/users/me/activity'),
  toggleBookmark: (problemId) => apiClient.post(`/users/me/bookmarks/${problemId}`),
};
