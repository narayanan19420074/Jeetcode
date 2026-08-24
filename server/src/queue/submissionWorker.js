import { Worker } from 'bullmq';
import { connectDB } from '../config/db.js';
import { getRedis } from '../services/redisClient.js';
import { processSubmission } from '../services/submission.service.js';
import { QUEUE_NAME } from './submissionQueue.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// Run this as a SEPARATE process from the API server:
//   npm run worker
// This is deliberate — the whole point of queuing is that Judge0 calls
// (network I/O, can take seconds) never share an event loop with the
// request-handling API. Scale workers and API instances independently.

async function main() {
  if (!env.REDIS_URL) {
    logger.warn('REDIS_URL not set — nothing to consume, submissions process inline via the API instead. Exiting.');
    process.exit(0);
  }

  await connectDB();
  const redis = getRedis();

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { submissionId } = job.data;
      logger.info(`Judging submission ${submissionId}`);
      await processSubmission(submissionId);
    },
    {
      connection: redis,
      concurrency: 5, // tune based on Judge0 rate limits available to you
    }
  );

  worker.on('completed', (job) => logger.info(`Submission ${job.data.submissionId} judged`));
  worker.on('failed', (job, err) => logger.error(`Submission ${job?.data?.submissionId} failed`, err));

  logger.info('Submission worker started, waiting for jobs...');
}

main().catch((err) => {
  logger.error('Worker failed to start', err);
  process.exit(1);
});
