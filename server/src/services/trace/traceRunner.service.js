import { ApiError } from '../../utils/ApiError.js';
import { traceJavaScript } from './nodeInspectorTrace.js';
import { tracePython } from './pythonTrace.js';
import { MAX_CONCURRENT_TRACES } from './traceLimits.js';

// Languages that can be followed line by line. Compiled languages would need a debugger per toolchain.
export const TRACEABLE_LANGUAGES = ['python', 'javascript'];

const MAX_SOURCE_CHARS = 100000;
const MAX_STDIN_CHARS = 1000000;
const TRACERS = { python: tracePython, javascript: traceJavaScript };

let activeTraces = 0;

export function isValidTraceJob(job) {
  const isLineNumber = (value) => Number.isInteger(value) && value >= 1;
  return Boolean(
    job &&
      TRACEABLE_LANGUAGES.includes(job.language) &&
      typeof job.sourceCode === 'string' &&
      job.sourceCode.length <= MAX_SOURCE_CHARS &&
      typeof job.stdin === 'string' &&
      job.stdin.length <= MAX_STDIN_CHARS &&
      isLineNumber(job.firstLine) &&
      isLineNumber(job.lastLine) &&
      job.firstLine <= job.lastLine
  );
}

// Runs the job on THIS machine. Only the isolated judge service (or a development machine) may call it.
export async function runTrace(job) {
  if (!isValidTraceJob(job)) throw ApiError.badRequest('Invalid trace request.');
  if (activeTraces >= MAX_CONCURRENT_TRACES) {
    throw ApiError.tooMany('The visualizer is busy right now. Try again in a few seconds.');
  }
  activeTraces += 1;
  try {
    return await TRACERS[job.language](job);
  } finally {
    activeTraces -= 1;
  }
}
