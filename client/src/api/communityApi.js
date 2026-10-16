import { apiClient } from './apiClient';

const base = '/community';

// `kind` for comments is 'solutions' | 'threads' (matches the URL segment).
export const communityApi = {
  // Solutions
  listSolutions: (slug, params) => apiClient.get(`${base}/problems/${slug}/solutions`, { params }),
  myAccepted: (slug) => apiClient.get(`${base}/problems/${slug}/my-accepted`),
  createSolution: (slug, body) => apiClient.post(`${base}/problems/${slug}/solutions`, body),
  getSolution: (id) => apiClient.get(`${base}/solutions/${id}`),
  updateSolution: (id, body) => apiClient.patch(`${base}/solutions/${id}`, body),
  deleteSolution: (id) => apiClient.delete(`${base}/solutions/${id}`),

  // Discussion threads
  listThreads: (slug, params) => apiClient.get(`${base}/problems/${slug}/threads`, { params }),
  createThread: (slug, body) => apiClient.post(`${base}/problems/${slug}/threads`, body),
  getThread: (id) => apiClient.get(`${base}/threads/${id}`),
  updateThread: (id, body) => apiClient.patch(`${base}/threads/${id}`, body),
  deleteThread: (id) => apiClient.delete(`${base}/threads/${id}`),

  // Comments (nested replies)
  listComments: (kind, id) => apiClient.get(`${base}/${kind}/${id}/comments`),
  createComment: (kind, id, body) => apiClient.post(`${base}/${kind}/${id}/comments`, body),
  updateComment: (id, body) => apiClient.patch(`${base}/comments/${id}`, body),
  deleteComment: (id) => apiClient.delete(`${base}/comments/${id}`),

  // Votes + reports
  vote: (targetType, targetId, value) => apiClient.post(`${base}/votes`, { targetType, targetId, value }),
  report: (body) => apiClient.post(`${base}/reports`, body),
};
