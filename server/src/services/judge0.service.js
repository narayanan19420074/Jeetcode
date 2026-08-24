import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Judge0 CE's standard language IDs (stable across CE public + self-hosted
// instances using the default language list). Centralizing this map means
// swapping providers later only touches this file.
export const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  cpp: 54, // C++ (GCC)
};

// Judge0 status IDs -> our Submission.status enum.
// 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=TLE,
// 6=Compilation Error, 7-12=various Runtime Errors, 13+=Internal/other.
function mapStatus(statusId) {
  if (statusId === 3) return 'Accepted';
  if (statusId === 4) return 'Wrong Answer';
  if (statusId === 5) return 'Time Limit Exceeded';
  if (statusId === 6) return 'Compilation Error';
  if (statusId >= 7 && statusId <= 12) return 'Runtime Error';
  return 'Internal Error';
}

function client() {
  const headers = { 'Content-Type': 'application/json' };
  // RapidAPI-hosted Judge0 needs these; the free ce.judge0.com instance
  // doesn't. Both paths work depending on which env vars are set.
  if (env.JUDGE0_API_KEY && env.JUDGE0_API_HOST) {
    headers['X-RapidAPI-Key'] = env.JUDGE0_API_KEY;
    headers['X-RapidAPI-Host'] = env.JUDGE0_API_HOST;
  }
  return axios.create({ baseURL: env.JUDGE0_API_URL, headers, timeout: 20000 });
}

const b64 = (str) => Buffer.from(str ?? '', 'utf-8').toString('base64');
const unb64 = (str) => (str ? Buffer.from(str, 'base64').toString('utf-8') : '');

/**
 * Submits a batch of {sourceCode, languageId, stdin, expectedOutput} to
 * Judge0 and returns the array of tokens to poll. Batching (rather than
 * one HTTP call per test case) is what keeps a 20-test-case submission
 * from taking 20 sequential round-trips.
 */
export async function submitBatch(items) {
  const payload = {
    submissions: items.map((it) => ({
      source_code: b64(it.sourceCode),
      language_id: it.languageId,
      stdin: b64(it.stdin),
      expected_output: b64(it.expectedOutput),
      cpu_time_limit: 5,
      memory_limit: 128000, // KB — matches the ~128MB cap from the original arch doc
    })),
  };

  try {
    const { data } = await client().post('/submissions/batch?base64_encoded=true', payload);
    return data.map((d) => d.token);
  } catch (err) {
    logger.error('Judge0 submitBatch failed', err);
    throw ApiError.internal('Code execution service is unavailable right now. Try again shortly.');
  }
}

/**
 * Polls Judge0 for a batch of tokens until every submission has finished
 * judging (statusId > 2) or maxAttempts is hit. Uses a short fixed
 * interval — Judge0 batch judging is typically sub-second per case.
 */
export async function pollBatchResults(tokens, { maxAttempts = 15, intervalMs = 1000 } = {}) {
  const fields = 'token,status,stdout,stderr,compile_output,time,memory';
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data } = await client().get('/submissions/batch', {
      params: { tokens: tokens.join(','), base64_encoded: true, fields },
    });
    const submissions = data.submissions;
    const allDone = submissions.every((s) => s.status.id > 2);

    if (allDone) {
      return submissions.map((s) => ({
        token: s.token,
        statusId: s.status.id,
        status: mapStatus(s.status.id),
        stdout: unb64(s.stdout),
        stderr: unb64(s.stderr || s.compile_output),
        time: s.time,
        memory: s.memory,
      }));
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw ApiError.internal('Judging timed out — the code may be too slow or the service is overloaded.');
}
