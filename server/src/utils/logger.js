// Minimal structured logger. Swap for pino/winston in production without
// touching call sites — everything goes through this module.
const ts = () => new Date().toISOString();

export const logger = {
  info: (msg, meta) => console.log(`[${ts()}] INFO  ${msg}`, meta ?? ''),
  warn: (msg, meta) => console.warn(`[${ts()}] WARN  ${msg}`, meta ?? ''),
  error: (msg, err) => console.error(`[${ts()}] ERROR ${msg}`, err?.stack || err || ''),
};
