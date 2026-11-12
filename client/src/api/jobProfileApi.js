import { apiClient } from './apiClient';

export const jobProfileApi = {
  get: () => apiClient.get('/job-profile/me'),
  getMember: (userId) => apiClient.get(`/job-profile/${userId}`),
  save: (profile) => apiClient.put('/job-profile/me', profile),
};
