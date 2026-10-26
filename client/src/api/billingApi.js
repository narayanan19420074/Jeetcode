import { apiClient } from './apiClient';

export const billingApi = {
  checkout: (plan) => apiClient.post('/billing/checkout', { plan }),
  verify: (payload) => apiClient.post('/billing/verify', payload),
  status: () => apiClient.get('/billing/status'),
  cancel: () => apiClient.post('/billing/cancel'),
};
