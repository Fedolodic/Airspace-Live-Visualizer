let sentry = null;

/**
 * Initialises the logger. Pass a Sentry DSN to enable reporting.
 *
 * @param {{dsn?: string}} [opts]
 */
export function init(opts = {}) {
  if (opts.dsn && window.Sentry) {
    window.Sentry.init({ dsn: opts.dsn });
    sentry = window.Sentry;
  }
}

/** Log a normal message. */
export function log(message, data) {
  console.log('[LOG]', message, data ?? '');
  if (sentry) {
    sentry.captureMessage(message, { level: 'info', extra: data });
  }
}

/** Log an error. */
export function error(err, data) {
  console.error('[ERROR]', err, data ?? '');
  if (sentry) {
    sentry.captureException(err, { extra: data });
  }
}
