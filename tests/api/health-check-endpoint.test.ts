/**
 * Tests for Health Check Endpoint
 * GET /api/health
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../setup';

// Mock Redis module
vi.mock('@/lib/redis-client', () => ({
  isConnected: vi.fn(() => true),
  get: vi.fn(async (key: string) => {
    if (key === 'health:check:ping') return 'pong';
    return null;
  }),
  set: vi.fn(async () => {}),
}));

// Mock Storage Service module
vi.mock('@/lib/storage-service', () => ({
  isStorageConfigured: vi.fn(() => true),
  getFileMetadata: vi.fn(async () => {
    // Simulate NotFound error (which means S3 is working, just file doesn't exist)
    const error: any = new Error('NotFound');
    error.name = 'NotFound';
    error.$metadata = { httpStatusCode: 404 };
    throw error;
  }),
}));

// Mock logger to avoid console output during tests
vi.mock('@/lib/logger-structured', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(() => 'test-error-id'),
  debug: vi.fn(),
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return healthy status when all services are up', async () => {
    // Mock database query
    prismaMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.uptime).toBeGreaterThanOrEqual(0);

    // Check services
    expect(data.services.database.status).toBe('up');
    expect(data.services.database.latencyMs).toBeDefined();

    expect(data.services.redis.status).toBe('up');
    expect(data.services.redis.latencyMs).toBeDefined();

    expect(data.services.storage.status).toBe('up');
    expect(data.services.storage.latencyMs).toBeDefined();
  });

  it('should return degraded status when Redis is down but database is up', async () => {
    // Mock database query success
    prismaMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    // Mock Redis failure
    const redis = await import('@/lib/redis-client');
    vi.mocked(redis.isConnected).mockReturnValueOnce(false);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.status).toBe('degraded');
    expect(data.services.database.status).toBe('up');
    expect(data.services.redis.status).toBe('down');
  });

  it('should return degraded status when storage is down but database is up', async () => {
    // Mock database query success
    prismaMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    // Mock storage failure
    const storage = await import('@/lib/storage-service');
    vi.mocked(storage.isStorageConfigured).mockReturnValueOnce(false);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.status).toBe('degraded');
    expect(data.services.database.status).toBe('up');
    expect(data.services.storage.status).toBe('down');
    expect(data.services.storage.message).toBe('S3 not configured');
  });

  it('should return unhealthy status when database is down', async () => {
    // Mock database query failure
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(503);

    const data = await response.json();

    expect(data.status).toBe('unhealthy');
    expect(data.services.database.status).toBe('down');
    expect(data.services.database.message).toBe('Connection refused');
  });

  it('should include response time in headers', async () => {
    // Mock database query
    prismaMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    const responseTime = response.headers.get('X-Response-Time');
    expect(responseTime).toBeDefined();
    expect(responseTime).toMatch(/^\d+ms$/);
  });

  it('should include cache control headers to prevent caching', async () => {
    // Mock database query
    prismaMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBe('no-cache, no-store, must-revalidate');
  });

  it('should measure database latency', async () => {
    // Mock database query with delay
    prismaMock.$queryRaw.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([{ result: 1 }]), 50);
        })
    );

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    const data = await response.json();

    expect(data.services.database.latencyMs).toBeGreaterThanOrEqual(50);
  });

  it('should handle complete service failure gracefully', async () => {
    // Mock all services failing
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error('DB Error'));

    const redis = await import('@/lib/redis-client');
    vi.mocked(redis.isConnected).mockReturnValueOnce(false);

    const storage = await import('@/lib/storage-service');
    vi.mocked(storage.isStorageConfigured).mockReturnValueOnce(false);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(503);

    const data = await response.json();

    expect(data.status).toBe('unhealthy');
    expect(data.services.database.status).toBe('down');
    expect(data.services.redis.status).toBe('down');
    expect(data.services.storage.status).toBe('down');
  });

  it('should complete health check within 100ms target (when services are fast)', async () => {
    // Mock fast responses
    prismaMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    const startTime = Date.now();
    const request = new NextRequest('http://localhost:3000/api/health');
    await GET(request);
    const duration = Date.now() - startTime;

    // Allow some margin for test execution overhead
    expect(duration).toBeLessThan(150);
  });
});
