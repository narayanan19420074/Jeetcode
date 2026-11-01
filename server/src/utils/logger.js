import { reportError } from '../config/sentry.js';

// Minimal structured logger. Swap for pino/winston in production without
// touching call sites — everything goes through this module.
const ts = () => new Date().toISOString();

// Every logged error is also sent to Sentry (when SENTRY_DSN is set), so failures the app handles
// quietly, such as an AI provider outage or a judge error, still reach the developer.
export const logger = {
  info: (msg, meta) => console.log(`[${ts()}] INFO  ${msg}`, meta ?? ''),
  warn: (msg, meta) => console.warn(`[${ts()}] WARN  ${msg}`, meta ?? ''),
  error: (msg, err) => {
    console.error(`[${ts()}] ERROR ${msg}`, err?.stack || err || '');
    reportError(msg, err);
  },
};
