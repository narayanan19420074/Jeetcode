import { apiClient } from './apiClient';

export const prepApi = {
  listCompanies: () => apiClient.get('/prep/companies'),
  getRoadmap: (slug) => apiClient.get(`/prep/companies/${slug}`),
  enroll: (slug) => apiClient.post(`/prep/companies/${slug}/enroll`),
  updateProgress: (slug, sectionId, payload) =>
    apiClient.post(`/prep/companies/${slug}/sections/${sectionId}/progress`, payload),
};
