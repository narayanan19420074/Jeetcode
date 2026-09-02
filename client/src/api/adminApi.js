import { apiClient } from './apiClient';

export const adminApi = {
  stats: () => apiClient.get('/admin/stats'),
  signups: () => apiClient.get('/admin/signups'),
  listProblems: (params) => apiClient.get('/admin/problems', { params }),
  createProblem: (payload) => apiClient.post('/admin/problems', payload),
  updateProblem: (id, payload) => apiClient.patch(`/admin/problems/${id}`, payload),
  publishProblem: (id, isPublished) => apiClient.patch(`/admin/problems/${id}/publish`, { isPublished }),
  deleteProblem: (id) => apiClient.delete(`/admin/problems/${id}`),
  bulkDeleteProblems: (ids) => apiClient.post('/admin/problems/bulk-delete', { ids }),
  restoreProblem: (id) => apiClient.patch(`/admin/problems/${id}/restore`),
};
