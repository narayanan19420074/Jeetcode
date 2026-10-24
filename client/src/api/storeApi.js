import { apiClient } from './apiClient';

export const storeApi = {
  items: () => apiClient.get('/store/items'),
  balance: () => apiClient.get('/store/balance'),
  wallet: () => apiClient.get('/store/wallet'),
  transactions: (params) => apiClient.get('/store/transactions', { params }),
  claimDaily: () => apiClient.post('/store/daily'),
  purchase: (slug, payload) => apiClient.post(`/store/items/${slug}/purchase`, payload),
  orders: () => apiClient.get('/store/orders'),
  cancelOrder: (id) => apiClient.post(`/store/orders/${id}/cancel`),
  lastAddress: () => apiClient.get('/store/address'),
  myCourses: () => apiClient.get('/store/courses/mine'),
  course: (slug) => apiClient.get(`/store/courses/${slug}`),
  markLesson: (slug, key, done) => apiClient.post(`/store/courses/${slug}/lessons/${key}`, { done }),
};
