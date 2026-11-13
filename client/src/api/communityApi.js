import { apiClient } from './apiClient';

const base = '/community';

// `kind` for comments is 'solutions' | 'threads' | 'posts' (matches the URL segment).
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

  // Community feed posts (global, not tied to a problem)
  listPosts: (params) => apiClient.get(`${base}/posts`, { params }),
  createPost: (body) => apiClient.post(`${base}/posts`, body),
  uploadImage: (blob) => apiClient.post(`${base}/images`, blob, { headers: { 'Content-Type': blob.type } }),
  getPost: (id) => apiClient.get(`${base}/posts/${id}`),
  deletePost: (id) => apiClient.delete(`${base}/posts/${id}`),

  // Feed engagement: save, repost, hide ("Not interested" and "Hide posts by ...") and follow an author
  savePost: (id) => apiClient.put(`${base}/posts/${id}/save`),
  unsavePost: (id) => apiClient.delete(`${base}/posts/${id}/save`),
  repostPost: (id) => apiClient.put(`${base}/posts/${id}/repost`),
  unrepostPost: (id) => apiClient.delete(`${base}/posts/${id}/repost`),
  hidePost: (id) => apiClient.put(`${base}/posts/${id}/hide`),
  hidePostAuthor: (id) => apiClient.put(`${base}/posts/${id}/hide-author`),
  followUser: (userId) => apiClient.put(`${base}/follows/${userId}`),
  unfollowUser: (userId) => apiClient.delete(`${base}/follows/${userId}`),

  // Member discovery: search every account, and the accounts the viewer may want to follow
  searchMembers: (q) => apiClient.get(`${base}/members/search`, { params: { q } }),
  suggestedMembers: (limit) => apiClient.get(`${base}/members/suggested`, { params: { limit } }),

  // Comments (nested replies)
  listComments: (kind, id) => apiClient.get(`${base}/${kind}/${id}/comments`),
  createComment: (kind, id, body) => apiClient.post(`${base}/${kind}/${id}/comments`, body),
  updateComment: (id, body) => apiClient.patch(`${base}/comments/${id}`, body),
  deleteComment: (id) => apiClient.delete(`${base}/comments/${id}`),

  // Votes + reports
  vote: (targetType, targetId, value) => apiClient.post(`${base}/votes`, { targetType, targetId, value }),
  report: (body) => apiClient.post(`${base}/reports`, body),
};
