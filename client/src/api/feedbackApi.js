import { apiClient } from './apiClient';

export const feedbackApi = {
  // payload: { type, subject?, message, name?, email?, pageUrl?, website? }
  submit: (payload) => apiClient.post('/feedback', payload),
};
