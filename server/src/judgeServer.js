import crypto from 'node:crypto';
import express from 'express';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { submitBatch, pollBatchResults, canRun } from './services/localJudge.service.js';

// Isolated code-execution service. Deployed as its own container (server/judge/Dockerfile) with
// JUDGE_SERVICE=true, so it has NO database or auth secrets. The main API calls POST /run with a
// shared bearer token. Even if submitted code escaped its sandbox here, there is nothing valuable to steal.

const MAX_ITEMS = 60;
const MAX_SOURCE_CHARS = 100_000;
const MAX_STDIN_CHARS = 1_000_000;
const SUPPORTED_LANGUAGE_IDS = new Set([63, 71, 54, 62]); // JavaScript, Python, C++, Java

const tokenDigest = crypto.createHash('sha256').update(env.JUDGE_SERVICE_TOKEN).digest();
function authorized(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  const given = crypto.createHash('sha256').update(header.slice(7)).digest();
  return crypto.timingSafeEqual(given, tokenDigest); // constant-time comparison
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, java: canRun(62) });
});

app.post('/run', async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    return res.status(400).json({ success: false, message: `items must be an array of 1 to ${MAX_ITEMS}` });
  }
  for (const it of items) {
    const ok =
      it &&
      typeof it.sourceCode === 'string' &&
      it.sourceCode.length <= MAX_SOURCE_CHARS &&
      SUPPORTED_LANGUAGE_IDS.has(it.languageId) &&
      (it.stdin === undefined || (typeof it.stdin === 'string' && it.stdin.length <= MAX_STDIN_CHARS)) &&
      (it.expectedOutput === undefined || typeof it.expectedOutput === 'string');
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid item in batch' });
  }

  try {
    const tokens = await submitBatch(items);
    const results = await pollBatchResults(tokens);
    res.json({ success: true, results });
  } catch (err) {
    logger.error('Judge run failed', err);
    res.status(500).json({ success: false, message: 'Judge internal error' });
  }
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

const server = app.listen(env.PORT, () => {
  logger.info(`JeetCode judge service listening on port ${env.PORT}`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
