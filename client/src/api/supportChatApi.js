import { apiClient } from './apiClient';

export const supportChatApi = {
  // Open conversation + messages. Pass `after` (ISO timestamp) to fetch only newer messages.
  get: (after) => apiClient.get('/support/chat', { params: after ? { after } : {} }),
  unread: () => apiClient.get('/support/chat/unread'),
  send: (text, topic) => apiClient.post('/support/chat/messages', { text, ...(topic ? { topic } : {}) }),
  close: () => apiClient.post('/support/chat/close'),
};
