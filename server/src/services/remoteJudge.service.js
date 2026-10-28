import axios from 'axios';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Client for the isolated judge service (judgeServer.js). Same contract as judge0.service.js:
// submitBatch(items) -> tokens, pollBatchResults(tokens) -> results.
// The service judges the whole batch in one request, so results are kept here until polled.

const RESULT_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 120000; // also covers a free-tier service waking from sleep
const results = new Map(); // token -> result

const RETRYABLE_STATUS = new Set([502, 503, 504]);

async function callJudge(payload) {
  const base = (env.JUDGE_SERVICE_URL || '').replace(/\/+$/, '');
  if (!base || !env.JUDGE_SERVICE_TOKEN) {
    logger.error('Remote judge is not configured (JUDGE_SERVICE_URL / JUDGE_SERVICE_TOKEN).');
    throw ApiError.internal('Code execution is not configured right now. Please try again later.');
  }

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data } = await axios.post(`${base}/run`, payload, {
        headers: { Authorization: `Bearer ${env.JUDGE_SERVICE_TOKEN}` },
        timeout: REQUEST_TIMEOUT_MS,
        maxBodyLength: 6 * 1024 * 1024,
      });
      return data;
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      const transient = !err.response || RETRYABLE_STATUS.has(status);
      if (!transient) break;
      await new Promise((r) => setTimeout(r, 3000)); // service may still be waking up
    }
  }
  logger.error('Remote judge request failed', lastErr);
  throw ApiError.internal('Code execution service is unavailable right now. Try again shortly.');
}

export async function submitBatch(items) {
  const data = await callJudge({
    items: items.map((it) => ({
      sourceCode: it.sourceCode ?? '',
      languageId: it.languageId,
      stdin: it.stdin ?? '',
      expectedOutput: it.expectedOutput ?? '',
    })),
  });

  if (!Array.isArray(data?.results) || data.results.length !== items.length) {
    logger.error('Remote judge returned an unexpected response');
    throw ApiError.internal('Code execution service returned an invalid response.');
  }

  return data.results.map((r) => {
    const token = `remote-${crypto.randomUUID()}`;
    results.set(token, { ...r, token });
    setTimeout(() => results.delete(token), RESULT_TTL_MS).unref();
    return token;
  });
}

export async function pollBatchResults(tokens) {
  return tokens.map((token) => {
    const r = results.get(token);
    if (!r) return { token, statusId: 13, status: 'Internal Error', stdout: '', stderr: 'Judge result expired. Submit again.', time: '0', memory: 0 };
    results.delete(token);
    return r;
  });
}
