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
  // activity feed, chat, nudge, code together, compare
  activity: (before) => apiClient.get('/friends/activity', { params: { before } }),
  chatUnread: () => apiClient.get('/friends/chat/unread'),
  chatOverview: () => apiClient.get('/friends/chat/overview'),
  chatHistory: (userId, before) => apiClient.get(`/friends/chat/${userId}`, { params: { before } }),
  chatSend: (userId, text) => apiClient.post(`/friends/chat/${userId}`, { text }),
  chatRead: (userId) => apiClient.post(`/friends/chat/${userId}/read`),
  nudge: (userId) => apiClient.post(`/friends/${userId}/nudge`),
  roomInvite: (userId, body = {}) => apiClient.post(`/friends/${userId}/room`, body),
  compare: (userId) => apiClient.get(`/friends/${userId}/compare`),
};
