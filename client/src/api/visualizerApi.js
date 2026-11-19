import { apiClient } from './apiClient';

// Tracing runs the learner's code line by line, which takes longer than a normal request. It must also
// outlast the server waiting for a sleeping free-tier judge (up to 120 s), or the learner sees a timeout
// while the trace is still on its way.
const TRACE_TIMEOUT_MS = 130000;

export const visualizerApi = {
  trace: ({ problemSlug, language, code, caseIndex }) =>
    apiClient.post('/visualizer/trace', { problemSlug, language, code, caseIndex }, { timeout: TRACE_TIMEOUT_MS }),
};
