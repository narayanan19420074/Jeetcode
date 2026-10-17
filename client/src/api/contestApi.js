import { apiClient } from './apiClient';

export const contestApi = {
  get: () => apiClient.get('/contests/current'),
  apply: () => apiClient.post('/contests/current/apply', { acceptedRules: true }),
  withdraw: () => apiClient.delete('/contests/current/apply'),
};
