import { apiClient } from './apiClient';

// Tracing runs the learner's code line by line, which takes longer than a normal request.
const TRACE_TIMEOUT_MS = 60000;

export const visualizerApi = {
  trace: ({ problemSlug, language, code, caseIndex }) =>
    apiClient.post('/visualizer/trace', { problemSlug, language, code, caseIndex }, { timeout: TRACE_TIMEOUT_MS }),
};
