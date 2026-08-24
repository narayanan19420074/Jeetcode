import { Queue } from 'bullmq';
import { getRedis } from '../services/redisClient.js';
import { processSubmission } from '../services/submission.service.js';
import { logger } from '../utils/logger.js';

const QUEUE_NAME = 'submissions';

let queue = null;
const redis = getRedis();
if (redis) {
  queue = new Queue(QUEUE_NAME, { connection: redis });
  logger.info('Submission queue initialized (BullMQ + Redis)');
} else {
  logger.warn('No Redis configured — submissions will process inline (fine for dev, not for 10L users).');
}

/**
 * Hands a submission off for judging. With Redis configured, this enqueues
 * a job and returns immediately — a separate worker process (npm run
 * worker) picks it up, so the API request thread is never blocked waiting
 * on Judge0. Without Redis, it processes synchronously so local dev needs
 * zero extra infrastructure.
 */
export async function enqueueSubmission(submissionId) {
  if (queue) {
    await queue.add('judge', { submissionId }, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 500,
      removeOnFail: 1000,
    });
    return { queued: true };
  }
  // Inline fallback — await the full judge cycle before responding.
  await processSubmission(submissionId);
  return { queued: false };
}

export { queue as submissionQueue, QUEUE_NAME };
