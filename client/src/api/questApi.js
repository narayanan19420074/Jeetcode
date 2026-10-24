import { apiClient } from './apiClient';

export const questApi = {
  get: () => apiClient.get('/quests'),
  claim: (id) => apiClient.post(`/quests/${id}/claim`),
  unlockButterfly: (id) => apiClient.post(`/quests/butterflies/${id}/unlock`),
  equipButterfly: (id) => apiClient.post(`/quests/butterflies/${id}/equip`),
};
