import { describe, it, expect, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const importModule = async () => import('@/lib/api-error-handler');

describe('handleApiError', () => {
  it('should return 409 for Prisma unique constraint violation (P2002)', async () => {
    const { handleApiError } = await importModule();
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    const res = handleApiError(error, 'creating user');
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe('Resource conflict');
    expect(data.errorId).toBeDefined();
  });

  it('should return 404 for Prisma record not found (P2025)', async () => {
    const { handleApiError } = await importModule();
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    });
    const res = handleApiError(error, 'fetching record');
    expect(res.status).toBe(404);
  });

  it('should return 500 for unknown Prisma error codes', async () => {
    const { handleApiError } = await importModule();
    const error = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '5.0.0',
    });
    const res = handleApiError(error, 'database operation');
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Database operation failed');
  });

  it('should return 400 for Prisma validation errors', async () => {
    const { handleApiError } = await importModule();
    const error = new Prisma.PrismaClientValidationError('Invalid field', {
      clientVersion: '5.0.0',
    });
    const res = handleApiError(error, 'validating data');
    expect(res.status).toBe(400);
  });

  it('should detect "not found" in error message', async () => {
    const { handleApiError } = await importModule();
    const error = new Error('Resource not found');
    const res = handleApiError(error, 'lookup');
    expect(res.status).toBe(404);
  });

  it('should detect "unauthorized" in error message', async () => {
    const { handleApiError } = await importModule();
    const error = new Error('User is unauthorized');
    const res = handleApiError(error, 'auth check');
    expect(res.status).toBe(401);
  });

  it('should detect "forbidden" in error message', async () => {
    const { handleApiError } = await importModule();
    const error = new Error('Access forbidden');
    const res = handleApiError(error, 'permission check');
    expect(res.status).toBe(403);
  });

  it('should detect "validation" in error message', async () => {
    const { handleApiError } = await importModule();
    const error = new Error('Validation failed');
    const res = handleApiError(error, 'input check');
    expect(res.status).toBe(400);
  });

  it('should return 500 for unknown errors', async () => {
    const { handleApiError } = await importModule();
    const res = handleApiError('string error', 'unknown operation');
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('An unexpected error occurred');
  });

  it('should include details in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { handleApiError } = await importModule();
    const error = new Error('Debug info');
    const res = handleApiError(error, 'dev test');
    const data = await res.json();
    expect(data.details).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('validationError', () => {
  it('should include details in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const { validationError } = await importModule();
    const res = validationError('Bad input', { field: 'email' });
    const data = await res.json();
    expect(data.details).toBeDefined();
    process.env.NODE_ENV = originalEnv;
  });

  it('should return 400 with error message', async () => {
    const { validationError } = await importModule();
    const res = validationError('Invalid input');
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid input');
  });
});

describe('notFoundError', () => {
  it('should return 404 with resource name', async () => {
    const { notFoundError } = await importModule();
    const res = notFoundError('User');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('User not found');
  });
});

describe('unauthorizedError', () => {
  it('should return 401', async () => {
    const { unauthorizedError } = await importModule();
    const res = unauthorizedError();
    expect(res.status).toBe(401);
  });
});

describe('forbiddenError', () => {
  it('should return 403 with default message', async () => {
    const { forbiddenError } = await importModule();
    const res = forbiddenError();
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Insufficient permissions');
  });

  it('should return 403 with custom message', async () => {
    const { forbiddenError } = await importModule();
    const res = forbiddenError('Admin only');
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Admin only');
  });
});
