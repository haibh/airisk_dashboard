/**
 * Structured API error handling utility
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server';
import { logger, generateErrorId } from './logger';
import { Prisma } from '@prisma/client';

// Standard API error response structure
interface ApiErrorResponse {
  error: string;
  errorId: string;
  details?: unknown;
}

// Known error types for better user messages
type ErrorType =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

// Map error types to HTTP status codes
const errorStatusMap: Record<ErrorType, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  DATABASE_ERROR: 500,
  INTERNAL_ERROR: 500,
};

// User-friendly error messages
const errorMessages: Record<ErrorType, string> = {
  VALIDATION_ERROR: 'Invalid request data',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  CONFLICT: 'Resource conflict',
  DATABASE_ERROR: 'Database operation failed',
  INTERNAL_ERROR: 'An unexpected error occurred',
};

/**
 * Detect error type from error instance
 */
function detectErrorType(error: unknown): ErrorType {
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return 'CONFLICT';
      case 'P2025': // Record not found
        return 'NOT_FOUND';
      default:
        return 'DATABASE_ERROR';
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'VALIDATION_ERROR';
  }

  // Generic Error with message hints
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('not found')) return 'NOT_FOUND';
    if (msg.includes('unauthorized') || msg.includes('unauthenticated')) return 'UNAUTHORIZED';
    if (msg.includes('forbidden') || msg.includes('permission')) return 'FORBIDDEN';
    if (msg.includes('validation') || msg.includes('invalid')) return 'VALIDATION_ERROR';
  }

  return 'INTERNAL_ERROR';
}

/**
 * Handle API errors with structured logging and response
 *
 * @param error - The caught error
 * @param context - Description of the operation that failed (e.g., "fetching AI systems")
 * @returns NextResponse with standardized error format
 */
export function handleApiError(error: unknown, context: string): NextResponse<ApiErrorResponse> {
  const errorId = generateErrorId();
  const errorType = detectErrorType(error);
  const status = errorStatusMap[errorType];
  const message = errorMessages[errorType];

  // Log the error with full details
  logger.error(`API Error: ${context}`, error, {
    context,
    errorId,
    data: {
      errorType,
      status,
    },
  });

  // Build response - include details only in development
  const response: ApiErrorResponse = {
    error: message,
    errorId,
  };

  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.details = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    };
  }

  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response
 */
export function validationError(message: string, details?: unknown): NextResponse<ApiErrorResponse> {
  const errorId = generateErrorId();

  logger.warn(`Validation Error: ${message}`, {
    context: 'validation',
    data: { details },
  });

  return NextResponse.json(
    {
      error: message,
      errorId,
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
    { status: 400 }
  );
}

/**
 * Create a not found error response
 */
export function notFoundError(resource: string): NextResponse<ApiErrorResponse> {
  const errorId = generateErrorId();

  return NextResponse.json(
    {
      error: `${resource} not found`,
      errorId,
    },
    { status: 404 }
  );
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedError(): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      errorId: generateErrorId(),
    },
    { status: 401 }
  );
}

/**
 * Create a forbidden error response
 */
export function forbiddenError(message = 'Insufficient permissions'): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      errorId: generateErrorId(),
    },
    { status: 403 }
  );
}
