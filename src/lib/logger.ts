/**
 * Structured logger for production debugging.
 *
 * All log entries are JSON-serializable objects with consistent shape so they
 * can be grep'd, parsed, and shipped to external log sinks. The tag prefix
 * (`[auth]`, `[lock]`, `[service]`, `[hook]`) lets you filter quickly in
 * DevTools or tail -f.
 *
 * Usage:
 *   logAuth('info', 'signin.success', { email: user.email });
 *   logService('error', 'NETWORK', { operation: 'pollService.getPolls', message: err.message });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type Component = 'auth' | 'lock' | 'service' | 'hook';

export interface LogEntry {
  t: string;
  component: Component;
  level: LogLevel;
  event: string;
  [k: string]: unknown;
}

export function log(
  component: Component,
  level: LogLevel,
  event: string,
  data: Record<string, unknown> = {},
): void {
  const entry: LogEntry = {
    t: new Date().toISOString(),
    component,
    level,
    event,
    ...data,
  };
  // Pre-stringify so log ingestion / e2e capture gets the full payload.
  // Pass both the object (for DevTools expansion) and the JSON string (for text grep).
  const tag = `[${component}] ${event}`;
  let json: string;
  try {
    json = JSON.stringify(entry);
  } catch {
    json = '{"error":"log entry not serializable"}';
  }
  // eslint-disable-next-line no-console
  if (level === 'error') console.error(tag, json, entry);
  // eslint-disable-next-line no-console
  else if (level === 'warn') console.warn(tag, json, entry);
  // eslint-disable-next-line no-console
  else console.log(tag, json, entry);
}

export const logAuth = (level: LogLevel, event: string, data?: Record<string, unknown>) =>
  log('auth', level, event, data);

export const logLock = (level: LogLevel, event: string, data?: Record<string, unknown>) =>
  log('lock', level, event, data);

export const logService = (level: LogLevel, event: string, data?: Record<string, unknown>) =>
  log('service', level, event, data);

export const logHook = (level: LogLevel, event: string, data?: Record<string, unknown>) =>
  log('hook', level, event, data);
