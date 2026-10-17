import { apiClient } from './apiClient';

// The server resolves "today" from the browser's UTC offset so a plan's day flips at the learner's local midnight.
const tz = () => ({ tzOffset: new Date().getTimezoneOffset() });

export const studyPlanApi = {
  list: () => apiClient.get('/study-plans', { params: tz() }),
  get: (id) => apiClient.get(`/study-plans/${id}`, { params: tz() }),
  create: (payload) => apiClient.post('/study-plans', payload),
  save: (id, payload) => apiClient.put(`/study-plans/${id}`, payload),
  remove: (id) => apiClient.delete(`/study-plans/${id}`),
  leave: (id) => apiClient.post(`/study-plans/${id}/leave`),
  previewJoin: (code) => apiClient.get(`/study-plans/join/${code}`),
  join: (code) => apiClient.post(`/study-plans/join/${code}`),
  feed: (id) => apiClient.get(`/study-plans/${id}/feed`),
  postMessage: (id, text) => apiClient.post(`/study-plans/${id}/messages`, { text }),
  nudge: (id, userId) => apiClient.post(`/study-plans/${id}/nudge/${userId}`, null, { params: tz() }),
  addMember: (id, userId) => apiClient.post(`/study-plans/${id}/members`, { userId }),
  notifications: () => apiClient.get('/study-plans/notifications'),
  markNotificationsRead: () => apiClient.post('/study-plans/notifications/read'),
  removeMember: (id, userId) => apiClient.delete(`/study-plans/${id}/members/${userId}`),
};

export const leaderboardApi = {
  get: (params) => apiClient.get('/leaderboard', { params }),
};
