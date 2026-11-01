// Crash reporting (Sentry) for the browser. Optional: with no VITE_SENTRY_DSN nothing is loaded or sent.
// The SDK loads lazily, so it never delays the first paint. Importing this module starts it, and the
// SDK then captures uncaught errors and unhandled promise rejections by itself; crashes caught by
// ErrorBoundary are sent through reportError.

const DSN = import.meta.env.VITE_SENTRY_DSN;

// Harmless browser notices that are not bugs.
const IGNORED_ERRORS = ['ResizeObserver loop limit exceeded', 'ResizeObserver loop completed with undelivered notifications.'];
const BREADCRUMB_URL_KEYS = ['url', 'from', 'to'];

// Reset-password and verify-email links carry one-time tokens in the query string, so addresses are
// always cut at "?" or "#" before they leave the browser.
const stripQuery = (url) => (typeof url === 'string' ? url.split(/[?#]/)[0] : url);

function scrubEvent(event) {
  if (event.request?.url) event.request.url = stripQuery(event.request.url);
  if (event.request?.query_string) delete event.request.query_string;
  return event;
}

function scrubBreadcrumb(breadcrumb) {
  BREADCRUMB_URL_KEYS.forEach((key) => {
    if (breadcrumb.data?.[key]) breadcrumb.data[key] = stripQuery(breadcrumb.data[key]);
  });
  return breadcrumb;
}

function startSentry() {
  return import('@sentry/react')
    .then((Sentry) => {
      Sentry.init({ dsn: DSN, environment: import.meta.env.MODE, ignoreErrors: IGNORED_ERRORS, beforeSend: scrubEvent, beforeBreadcrumb: scrubBreadcrumb });
      return Sentry;
    })
    .catch(() => null); // monitoring must never break the app
}

const sentryReady = DSN ? startSentry() : null;

export function reportError(error, details) {
  sentryReady?.then((Sentry) => Sentry?.captureException(error, { extra: details }));
}
