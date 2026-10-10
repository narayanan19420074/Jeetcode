import { apiClient } from './apiClient';

export const roomApi = {
  create: (body) => apiClient.post('/rooms', body),
  get: (id) => apiClient.get(`/rooms/${id}`),
};
