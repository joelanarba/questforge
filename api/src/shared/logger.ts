type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const configuredLevel: LogLevel =
  (process.env['LOG_LEVEL'] as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[configuredLevel];
}

export function log(
  level: LogLevel,
  msg: string,
  extra?: Record<string, unknown>,
): void {
  if (!shouldLog(level)) return;
  const entry = {
    level,
    msg,
    timestamp: new Date().toISOString(),
    ...extra,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

export const logger = {
  debug: (msg: string, extra?: Record<string, unknown>) =>
    log('debug', msg, extra),
  info: (msg: string, extra?: Record<string, unknown>) =>
    log('info', msg, extra),
  warn: (msg: string, extra?: Record<string, unknown>) =>
    log('warn', msg, extra),
  error: (msg: string, extra?: Record<string, unknown>) =>
    log('error', msg, extra),
};
