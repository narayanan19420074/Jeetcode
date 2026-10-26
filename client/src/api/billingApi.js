import { apiClient } from './apiClient';

export const billingApi = {
  checkout: (plan) => apiClient.post('/billing/checkout', { plan }),
  orderStatus: (orderId) => apiClient.get(`/billing/order/${encodeURIComponent(orderId)}`),
  status: () => apiClient.get('/billing/status'),
};
