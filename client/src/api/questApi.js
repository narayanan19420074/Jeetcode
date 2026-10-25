import { apiClient } from './apiClient';

export const questApi = {
  get: () => apiClient.get('/quests'),
  claim: (id) => apiClient.post(`/quests/${id}/claim`),
  convert: (diamonds) => apiClient.post('/quests/convert', { diamonds }),
  upgradeButterfly: () => apiClient.post('/quests/butterfly/upgrade'),
};
