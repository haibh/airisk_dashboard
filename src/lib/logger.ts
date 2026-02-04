/**
 * Structured logger for production-safe logging
 * Replaces console.log/error with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  errorId?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Generate unique error ID for tracking
export function generateErrorId(): string {
  return `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Format log entry for output
function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for production (better for log aggregators)
    return JSON.stringify(entry);
  }
  // Human-readable format for development
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` [${entry.context}]` : '';
  const errId = entry.errorId ? ` (${entry.errorId})` : '';
  return `${prefix}${ctx}${errId}: ${entry.message}`;
}

// Create log entry
function createLogEntry(
  level: LogLevel,
  message: string,
  options?: { context?: string; errorId?: string; data?: Record<string, unknown> }
): LogEntry {
  return {
    level,
    message,
    context: options?.context,
    errorId: options?.errorId,
    timestamp: new Date().toISOString(),
    data: options?.data,
  };
}

export const logger = {
  debug(message: string, options?: { context?: string; data?: Record<string, unknown> }) {
    if (!isProduction) {
      const entry = createLogEntry('debug', message, options);
      console.log(formatLogEntry(entry), options?.data || '');
    }
  },

  info(message: string, options?: { context?: string; data?: Record<string, unknown> }) {
    const entry = createLogEntry('info', message, options);
    console.log(formatLogEntry(entry), options?.data || '');
  },

  warn(message: string, options?: { context?: string; data?: Record<string, unknown> }) {
    const entry = createLogEntry('warn', message, options);
    console.warn(formatLogEntry(entry), options?.data || '');
  },

  error(
    message: string,
    error?: unknown,
    options?: { context?: string; errorId?: string; data?: Record<string, unknown> }
  ) {
    const errorId = options?.errorId || generateErrorId();
    const entry = createLogEntry('error', message, { ...options, errorId });

    // In production, don't log full stack traces to console (send to monitoring service instead)
    if (isProduction) {
      console.error(formatLogEntry(entry));
    } else {
      console.error(formatLogEntry(entry), error, options?.data || '');
    }

    return errorId;
  },
};

export default logger;
