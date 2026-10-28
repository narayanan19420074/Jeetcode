import { apiClient } from './apiClient';

export const mockApi = {
  list: () => apiClient.get('/mocks'),
  start: (paperId) => apiClient.post(`/mocks/${paperId}/start`),
  getPaper: (attemptId) => apiClient.get(`/mocks/attempts/${attemptId}/paper`),
  save: (attemptId, updates) => apiClient.post(`/mocks/attempts/${attemptId}/save`, { updates }),
  submitSection: (attemptId, updates = []) => apiClient.post(`/mocks/attempts/${attemptId}/section-submit`, { updates }),
  submit: (attemptId, updates = []) => apiClient.post(`/mocks/attempts/${attemptId}/submit`, { updates }),
  getResult: (attemptId) => apiClient.get(`/mocks/attempts/${attemptId}/result`),
};
