import { apiClient } from './apiClient';

export const aiApi = {
  hint: (payload) => apiClient.post('/ai/hint', payload),
};
