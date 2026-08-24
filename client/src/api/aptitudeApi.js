import { apiClient } from './apiClient';

export const aptitudeApi = {
  listPatterns: () => apiClient.get('/aptitude/patterns'),
  getPattern: (slug) => apiClient.get(`/aptitude/patterns/${slug}`),
  getAttemptHistory: (slug) => apiClient.get(`/aptitude/patterns/${slug}/attempts`),
  getAttempt(attemptId) {
  return apiClient.get(`/aptitude/attempts/${attemptId}`);
  },

  startAttempt: (slug, mode) => apiClient.post(`/aptitude/patterns/${slug}/start`, { mode }),
  getAttemptQuestions: (attemptId) => apiClient.get(`/aptitude/attempts/${attemptId}/questions`),
  checkAnswer: (attemptId, questionId, selectedOption) =>
    apiClient.post(`/aptitude/attempts/${attemptId}/check`, { questionId, selectedOption }),
  submitAttempt: (attemptId, answers) => apiClient.post(`/aptitude/attempts/${attemptId}/submit`, { answers }),
};
