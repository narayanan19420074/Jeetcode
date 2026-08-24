import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';


async function main() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`JeetCode API listening on port ${env.PORT} (${env.NODE_ENV})`);
    if (!env.REDIS_URL) {
      logger.warn('Reminder: no REDIS_URL set — submissions are judged inline in this process, not queued.');
    }
  });

  // Graceful shutdown — let in-flight requests finish instead of dropping
  // them when the platform (Render/Railway) sends SIGTERM on redeploy.
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal error during startup', err);
  process.exit(1);
});
