import { apiClient } from './apiClient';

export const aptitudeApi = {
  listPatterns: () => apiClient.get('/aptitude/patterns'),
  // Hub payload: pattern, Learn progress, recent tests, in-progress test,
  // practice stats (difficulty split + per-sub-pattern mastery).
  getPattern: (slug) => apiClient.get(`/aptitude/patterns/${slug}`),
  getAttemptHistory: (slug) => apiClient.get(`/aptitude/patterns/${slug}/attempts`),
  getAttempt(attemptId) {
    return apiClient.get(`/aptitude/attempts/${attemptId}`);
  },

  // Learn
  completeLearn: (slug) => apiClient.post(`/aptitude/patterns/${slug}/complete-learn`),
  markSubsectionComplete: (slug, subsectionId, totalSubsections) =>
    apiClient.post(`/aptitude/patterns/${slug}/learn-progress`, { subsectionId, totalSubsections }),

  // Practice — LeetCode-style problem set
  listPracticeQuestions: (slug, params) =>
    apiClient.get(`/aptitude/patterns/${slug}/practice/questions`, { params }),
  getPracticeQuestion: (slug, questionId) =>
    apiClient.get(`/aptitude/patterns/${slug}/practice/questions/${questionId}`),
  checkPracticeAnswer: (slug, questionId, selectedOption, timeSpentSec) =>
    apiClient.post(`/aptitude/patterns/${slug}/practice/questions/${questionId}/check`, {
      selectedOption,
      timeSpentSec,
    }),
  bookmarkQuestion: (slug, questionId, bookmarked) =>
    apiClient.post(`/aptitude/patterns/${slug}/practice/questions/${questionId}/bookmark`, { bookmarked }),

  // Test — TCS iON style exam. startAttempt is idempotent for tests (resumes).
  startAttempt: (slug, mode = 'test') => apiClient.post(`/aptitude/patterns/${slug}/start`, { mode }),
  getAttemptQuestions: (attemptId) => apiClient.get(`/aptitude/attempts/${attemptId}/questions`),
  saveAttempt: (attemptId, updates) => apiClient.post(`/aptitude/attempts/${attemptId}/save`, { updates }),
  submitAttempt: (attemptId, updates = []) =>
    apiClient.post(`/aptitude/attempts/${attemptId}/submit`, { updates }),

  // Legacy practice *session* check (unused by the current UI).
  checkAnswer: (attemptId, questionId, selectedOption) =>
    apiClient.post(`/aptitude/attempts/${attemptId}/check`, { questionId, selectedOption }),
};
