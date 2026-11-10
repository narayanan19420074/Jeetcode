import { apiClient } from './apiClient';

export const jobProfileApi = {
  get: () => apiClient.get('/job-profile/me'),
  save: (profile) => apiClient.put('/job-profile/me', profile),
};
