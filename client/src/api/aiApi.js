import { apiClient } from './apiClient';

export const aiApi = {
  hint: (payload) => apiClient.post('/ai/hint', payload),
  // Returns the learner's complete, corrected code: { code }.
  fix: (payload) => apiClient.post('/ai/fix', payload),
  // Returns the ephemeral token and locked config for a Gemini Live voice session.
  liveSession: (payload) => apiClient.post('/ai/live-session', payload),
};
