import { env } from './env.js';

// Crash reporting (Sentry). Entirely optional: with no SENTRY_DSN nothing is loaded and nothing is sent.
// The SDK is imported only when a DSN is set, so local development and the judge service stay light.
// Uncaught exceptions and unhandled promise rejections are captured by the SDK itself; errors the app
// catches and logs reach Sentry through logger.error (see utils/logger.js).

const sentry = env.SENTRY_DSN ? await import('@sentry/node') : null;

sentry?.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });

const MAX_DETAIL_LENGTH = 500;

// `message` says where it happened. `error` may be an Error or just text (for example a provider's error body).
export function reportError(message, error) {
  if (!sentry) return;
  const isError = error instanceof Error;
  const detail = isError ? undefined : String(error ?? '').slice(0, MAX_DETAIL_LENGTH);
  sentry.captureException(isError ? error : new Error(message), { extra: { message, detail } });
}
