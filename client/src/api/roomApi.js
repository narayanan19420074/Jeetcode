import { apiClient } from './apiClient';

export const roomApi = {
  create: (body) => apiClient.post('/rooms', body),
  get: (id) => apiClient.get(`/rooms/${id}`),
  // aptitude study rooms: questions of the room's pattern (no answers)
  questions: (id, params) => apiClient.get(`/rooms/${id}/questions`, { params }),
};
