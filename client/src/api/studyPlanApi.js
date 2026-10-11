import { apiClient } from './apiClient';

// Server resolves "today" from the browser's UTC offset so Day N flips at the user's local midnight.
const tz = () => ({ tzOffset: new Date().getTimezoneOffset() });

export const studyPlanApi = {
  list: () => apiClient.get('/study-plans', { params: tz() }),
  today: () => apiClient.get('/study-plans/today', { params: tz() }),
  create: (payload) => apiClient.post('/study-plans', payload),
  get: (id) => apiClient.get(`/study-plans/${id}`, { params: tz() }),
  compare: (id) => apiClient.get(`/study-plans/${id}/compare`, { params: tz() }),
  update: (id, payload) => apiClient.patch(`/study-plans/${id}`, payload),
  remove: (id) => apiClient.delete(`/study-plans/${id}`),
  leave: (id) => apiClient.post(`/study-plans/${id}/leave`),
  toggleItem: (id, itemId, done) =>
    apiClient.post(`/study-plans/${id}/items/${itemId}/toggle`, { done }, { params: tz() }),
  previewJoin: (code) => apiClient.get(`/study-plans/join/${code}`),
  join: (code) => apiClient.post(`/study-plans/join/${code}`),
};

export const leaderboardApi = {
  get: (params) => apiClient.get('/leaderboard', { params }),
};
