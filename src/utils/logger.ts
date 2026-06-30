import { environment } from '~config';

export type LogContext = Readonly<Record<string, unknown>>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

type LogLevel = Exclude<typeof environment.logLevel, 'silent'>;

const logPriority: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Returns whether a message should be emitted for the configured log level.
 */
function isEnabled(level: LogLevel): boolean {
  return (
    environment.logLevel !== 'silent' &&
    logPriority[level] >= logPriority[environment.logLevel]
  );
}

/**
 * Emits structured extension logs without leaking data through string
 * interpolation.
 */
function write(level: LogLevel, message: string, context?: LogContext): void {
  if (!isEnabled(level)) {
    return;
  }

  const payload = context
    ? ['[InboxMind]', message, context]
    : ['[InboxMind]', message];

  console[level](...payload);
}

/**
 * Shared structured logger for extension contexts.
 */
export const logger: Logger = {
  debug: (message, context) => {
    write('debug', message, context);
  },
  info: (message, context) => {
    write('info', message, context);
  },
  warn: (message, context) => {
    write('warn', message, context);
  },
  error: (message, context) => {
    write('error', message, context);
  },
};
