/**
 * Structured service error type.
 *
 * Services catch errors and convert them to `ServiceError` before logging, so
 * every failure has consistent context: code category, human message, the
 * operation that failed, the original cause, and whether it's retryable.
 *
 * UI-facing code still receives safe defaults (empty arrays, null) to avoid
 * breaking existing consumers — the error is captured in structured logs
 * instead.
 */

export type ServiceErrorCode =
  | 'NETWORK'       // fetch failed, DNS, offline
  | 'AUTH'          // JWT expired/invalid
  | 'RLS'           // Postgres RLS denial
  | 'NOT_FOUND'     // no rows / 404
  | 'VALIDATION'    // constraint violation / bad input
  | 'TIMEOUT'       // lock acquire / request timeout
  | 'UNKNOWN';

export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  operation: string;
  cause?: unknown;
  retryable: boolean;
}

/**
 * Classify an unknown error into a ServiceError.
 *
 * Handles the common cases we see from Supabase's PostgREST client, browser
 * fetch failures, and JWT errors. Falls back to UNKNOWN for anything we can't
 * categorize.
 */
export function toServiceError(operation: string, err: unknown): ServiceError {
  // Network / fetch failures (offline, DNS, CORS) — real TypeError
  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return {
      code: 'NETWORK',
      message: err.message,
      operation,
      cause: err,
      retryable: true,
    };
  }

  // PostgREST / Supabase errors with a `code` property
  const e = err as { code?: string; message?: string; details?: string; hint?: string };

  // Supabase wraps `TypeError: Failed to fetch` in a plain object with empty code.
  // Detect this via the message/details string.
  if (/failed to fetch|network ?error|err_network/i.test(e?.message ?? '') ||
      /failed to fetch|network ?error/i.test(e?.details ?? '')) {
    return {
      code: 'NETWORK',
      message: e.message ?? 'Network request failed',
      operation,
      cause: err,
      retryable: true,
    };
  }

  if (e?.code === '42501' || e?.code === 'PGRST301') {
    return {
      code: 'RLS',
      message: e.message ?? 'Permission denied by row-level security',
      operation,
      cause: err,
      retryable: false,
    };
  }

  if (e?.code === 'PGRST116' || e?.code === 'PGRST117') {
    return {
      code: 'NOT_FOUND',
      message: e.message ?? 'Resource not found',
      operation,
      cause: err,
      retryable: false,
    };
  }

  if (e?.code === '23505' || e?.code === '23503' || e?.code === '23514') {
    return {
      code: 'VALIDATION',
      message: e.message ?? 'Constraint violation',
      operation,
      cause: err,
      retryable: false,
    };
  }

  if (e?.code === '401' || /jwt|unauthorized/i.test(e?.message ?? '')) {
    return {
      code: 'AUTH',
      message: e.message ?? 'Authentication failed',
      operation,
      cause: err,
      retryable: true,
    };
  }

  if (/timeout|timed out/i.test(e?.message ?? '')) {
    return {
      code: 'TIMEOUT',
      message: e.message ?? 'Operation timed out',
      operation,
      cause: err,
      retryable: true,
    };
  }

  return {
    code: 'UNKNOWN',
    message: e?.message ?? String(err),
    operation,
    cause: err,
    retryable: false,
  };
}
