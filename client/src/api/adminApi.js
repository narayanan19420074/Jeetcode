import { apiClient } from './apiClient';

export const adminApi = {
  // --- Overview ---
  stats: () => apiClient.get('/admin/stats'),
  signups: () => apiClient.get('/admin/signups'),
  auditLog: (params) => apiClient.get('/admin/audit-log', { params }),

  // --- Problems ---
  listProblems: (params) => apiClient.get('/admin/problems', { params }),
  createProblem: (payload) => apiClient.post('/admin/problems', payload),
  updateProblem: (id, payload) => apiClient.patch(`/admin/problems/${id}`, payload),
  publishProblem: (id, isPublished) => apiClient.patch(`/admin/problems/${id}/publish`, { isPublished }),
  deleteProblem: (id) => apiClient.delete(`/admin/problems/${id}`),
  bulkDeleteProblems: (ids) => apiClient.post('/admin/problems/bulk-delete', { ids }),
  restoreProblem: (id) => apiClient.patch(`/admin/problems/${id}/restore`),

  // --- Aptitude ---
  listPatterns: () => apiClient.get('/admin/aptitude/patterns'),
  createPattern: (payload) => apiClient.post('/admin/aptitude/patterns', payload),
  updatePattern: (id, payload) => apiClient.patch(`/admin/aptitude/patterns/${id}`, payload),
  publishPattern: (id, isPublished) => apiClient.patch(`/admin/aptitude/patterns/${id}/publish`, { isPublished }),
  deletePattern: (id) => apiClient.delete(`/admin/aptitude/patterns/${id}`),
  listQuestions: (patternId) => apiClient.get('/admin/aptitude/questions', { params: { patternId } }),
  createQuestion: (payload) => apiClient.post('/admin/aptitude/questions', payload),
  updateQuestion: (id, payload) => apiClient.patch(`/admin/aptitude/questions/${id}`, payload),
  deleteQuestion: (id) => apiClient.delete(`/admin/aptitude/questions/${id}`),

  // --- Users ---
  listUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),
  setUserPro: (id, payload) => apiClient.patch(`/admin/users/${id}/pro`, payload),

  // --- Licenses ---
  listLicenses: () => apiClient.get('/admin/licenses'),
  generateLicense: (payload) => apiClient.post('/admin/licenses/generate', payload),
};
