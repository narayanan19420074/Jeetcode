import { apiClient } from './apiClient';

export const friendsApi = {
  list: () => apiClient.get('/friends'),
  search: (q) => apiClient.get('/friends/search', { params: { q } }),
  sendRequest: (handle) => apiClient.post('/friends/requests', { handle }),
  accept: (id) => apiClient.post(`/friends/requests/${id}/accept`),
  decline: (id) => apiClient.post(`/friends/requests/${id}/decline`),
  cancel: (id) => apiClient.delete(`/friends/requests/${id}`),
  remove: (userId) => apiClient.delete(`/friends/${userId}`),
  previewInvite: (handle) => apiClient.get(`/friends/invite/${handle}`),
  acceptInvite: (handle) => apiClient.post(`/friends/invite/${handle}`),
};
