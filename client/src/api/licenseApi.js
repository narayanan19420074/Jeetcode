import { apiClient } from './apiClient';

export const licenseApi = {
  activate: (licenseKey) => apiClient.post('/licenses/activate', { licenseKey }),
};
