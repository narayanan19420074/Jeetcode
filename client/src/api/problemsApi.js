import { apiClient } from './apiClient';

export const problemsApi = {
  list: (params) => apiClient.get('/problems', { params }),
  getBySlug: (slug) => apiClient.get(`/problems/${slug}`),
  getTags: () => apiClient.get('/problems/tags'),
  getCompanies: () => apiClient.get('/problems/companies'),
  getProgress: () => apiClient.get('/problems/progress'),
  getRandom: (params) => apiClient.get('/problems/random', { params }),
};
