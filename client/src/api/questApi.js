import { apiClient } from './apiClient';

export const questApi = {
  get: () => apiClient.get('/quests'),
  claim: (id) => apiClient.post(`/quests/${id}/claim`),
};
