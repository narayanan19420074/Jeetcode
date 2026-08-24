import { apiClient } from './apiClient';

export const submissionsApi = {
  create: (payload) => apiClient.post('/submissions', payload),
  get: (id) => apiClient.get(`/submissions/${id}`),
  history: (params) => apiClient.get('/submissions/me', { params }),
};
