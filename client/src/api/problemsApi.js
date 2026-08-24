import { apiClient } from './apiClient';

export const problemsApi = {
  list: (params) => apiClient.get('/problems', { params }),
  getBySlug: (slug) => apiClient.get(`/problems/${slug}`),
};
