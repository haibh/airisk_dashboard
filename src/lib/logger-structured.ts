/**
 * Structured Logger for Production-Safe Logging
 *
 * Features:
 * - JSON format for log aggregation (production)
 * - Human-readable format (development)
 * - Correlation ID tracking
 * - Sensitive data redaction
 * - Request/DB query logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /credential/i,
  /bearer/i,
  /authorization/i,
];

/**
 * Redact sensitive data from objects
 */
function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Check if key matches sensitive pattern
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));

    if (isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for production (better for log aggregators like CloudWatch, Datadog, etc.)
    return JSON.stringify(entry);
  }

  // Human-readable format for development
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const corrId = entry.correlationId ? ` [corr:${entry.correlationId}]` : '';
  const userId = entry.userId ? ` [user:${entry.userId}]` : '';
  const reqId = entry.requestId ? ` [req:${entry.requestId}]` : '';
  const dur = entry.duration ? ` (${entry.duration}ms)` : '';

  return `${prefix}${corrId}${userId}${reqId}${dur}: ${entry.message}`;
}

/**
 * Create log entry with optional metadata
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  metadata?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>
): LogEntry {
  // Redact sensitive data from metadata
  const safeMetadata = metadata?.metadata
    ? redactSensitiveData(metadata.metadata)
    : undefined;

  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: metadata?.correlationId,
    userId: metadata?.userId,
    requestId: metadata?.requestId,
    duration: metadata?.duration,
    metadata: safeMetadata,
  };
}

/**
 * Log debug message (only in development)
 */
export function debug(message: string, metadata?: Record<string, unknown>): void {
  if (!isProduction) {
    const entry = createLogEntry('debug', message, { metadata });
    console.log(formatLogEntry(entry), metadata || '');
  }
}

/**
 * Log info message
 */
export function info(message: string, metadata?: Record<string, unknown>): void {
  const entry = createLogEntry('info', message, { metadata });
  console.log(formatLogEntry(entry), metadata && !isProduction ? metadata : '');
}

/**
 * Log warning message
 */
export function warn(message: string, metadata?: Record<string, unknown>): void {
  const entry = createLogEntry('warn', message, { metadata });
  console.warn(formatLogEntry(entry), metadata && !isProduction ? metadata : '');
}

/**
 * Log error message
 */
export function error(message: string, err?: Error, metadata?: Record<string, unknown>): string {
  const errorId = `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();

  const entry = createLogEntry('error', message, {
    metadata: {
      ...metadata,
      errorId,
      errorMessage: err?.message,
      errorStack: !isProduction ? err?.stack : undefined,
    },
  });

  // In production, don't log full stack traces to console (send to monitoring service instead)
  if (isProduction) {
    console.error(formatLogEntry(entry));
  } else {
    console.error(formatLogEntry(entry), err, metadata || '');
  }

  return errorId;
}

/**
 * General log function with level parameter
 */
export function log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
  switch (level) {
    case 'debug':
      debug(message, metadata);
      break;
    case 'info':
      info(message, metadata);
      break;
    case 'warn':
      warn(message, metadata);
      break;
    case 'error':
      error(message, undefined, metadata);
      break;
  }
}

/**
 * Log HTTP request with timing
 */
export function logRequest(
  method: string,
  url: string,
  status: number,
  duration: number,
  metadata?: {
    correlationId?: string;
    userId?: string;
    requestId?: string;
    ip?: string;
  }
): void {
  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  const message = `${method} ${url} ${status}`;

  const entry = createLogEntry(level, message, {
    duration,
    correlationId: metadata?.correlationId,
    userId: metadata?.userId,
    requestId: metadata?.requestId,
    metadata: {
      method,
      url,
      status,
      ip: metadata?.ip,
    },
  });

  if (level === 'error') {
    console.error(formatLogEntry(entry));
  } else if (level === 'warn') {
    console.warn(formatLogEntry(entry));
  } else {
    console.log(formatLogEntry(entry));
  }
}

/**
 * Log database query with timing
 */
export function logDbQuery(
  query: string,
  duration: number,
  metadata?: {
    correlationId?: string;
    userId?: string;
    params?: unknown;
  }
): void {
  // Only log slow queries in production (> 1s)
  if (isProduction && duration < 1000) {
    return;
  }

  const level: LogLevel = duration > 3000 ? 'warn' : 'debug';
  const message = `DB Query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`;

  const entry = createLogEntry(level, message, {
    duration,
    correlationId: metadata?.correlationId,
    userId: metadata?.userId,
    metadata: {
      query: query.substring(0, 200), // Truncate long queries
      params: metadata?.params ? redactSensitiveData(metadata.params) : undefined,
    },
  });

  if (level === 'warn') {
    console.warn(formatLogEntry(entry));
  } else if (!isProduction) {
    console.log(formatLogEntry(entry));
  }
}

/**
 * Export all logging functions as default object
 */
export default {
  log,
  debug,
  info,
  warn,
  error,
  logRequest,
  logDbQuery,
};
