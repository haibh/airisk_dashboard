/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns service status for all dependencies:
 * - Database (PostgreSQL)
 * - Redis cache
 * - S3 storage
 * - Overall system health
 *
 * Target: < 100ms response time
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import * as redis from '@/lib/redis-client';
import { isStorageConfigured, getFileMetadata } from '@/lib/storage-service';
import * as logger from '@/lib/logger-structured';

interface ServiceStatus {
  status: 'up' | 'down';
  latencyMs?: number;
  message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    storage: ServiceStatus;
  };
  uptime: number;
}

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * Check database connectivity with latency measurement
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;

    const latencyMs = Date.now() - startTime;

    return {
      status: 'up',
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    logger.error('Database health check failed', error as Error, {
      latencyMs,
    });

    return {
      status: 'down',
      latencyMs,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Redis connectivity with latency measurement
 */
async function checkRedis(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check if Redis is connected
    const isConnected = redis.isConnected();

    if (!isConnected) {
      return {
        status: 'down',
        latencyMs: Date.now() - startTime,
        message: 'Redis not connected',
      };
    }

    // Test PING command
    const testKey = 'health:check:ping';
    await redis.set(testKey, 'pong', 5); // 5 second TTL
    const result = await redis.get<string>(testKey);

    const latencyMs = Date.now() - startTime;

    if (result === 'pong') {
      return {
        status: 'up',
        latencyMs,
      };
    }

    return {
      status: 'down',
      latencyMs,
      message: 'PING test failed',
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    logger.error('Redis health check failed', error as Error, {
      latencyMs,
    });

    return {
      status: 'down',
      latencyMs,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check S3 storage connectivity
 */
async function checkStorage(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check if S3 is configured
    const isConfigured = isStorageConfigured();

    if (!isConfigured) {
      return {
        status: 'down',
        latencyMs: Date.now() - startTime,
        message: 'S3 not configured',
      };
    }

    // Try to check bucket by testing a known path (non-existent is OK, just checking connectivity)
    // This is lightweight - just sends HEAD request to S3
    await getFileMetadata('health-check-test-key');

    const latencyMs = Date.now() - startTime;

    return {
      status: 'up',
      latencyMs,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;

    // If we get a NotFound error, it means S3 is actually working (bucket exists, just not the file)
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return {
        status: 'up',
        latencyMs,
      };
    }

    logger.error('Storage health check failed', error as Error, {
      latencyMs,
    });

    return {
      status: 'down',
      latencyMs,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Determine overall system health based on service statuses
 */
function determineOverallHealth(services: HealthResponse['services']): 'healthy' | 'degraded' | 'unhealthy' {
  const { database, redis, storage } = services;

  // If database is down, system is unhealthy (critical service)
  if (database.status === 'down') {
    return 'unhealthy';
  }

  // If Redis or Storage is down, system is degraded but operational
  if (redis.status === 'down' || storage.status === 'down') {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * GET /api/health
 * Returns health status of all services
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Run health checks in parallel for faster response
    const [database, redis, storage] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkStorage(),
    ]);

    const services = { database, redis, storage };
    const overallStatus = determineOverallHealth(services);

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services,
      uptime: Math.floor((Date.now() - serverStartTime) / 1000), // uptime in seconds
    };

    const duration = Date.now() - startTime;

    // Log health check if it's slow or unhealthy
    if (duration > 100 || overallStatus !== 'healthy') {
      logger.warn('Health check completed', {
        duration,
        status: overallStatus,
        services: {
          database: database.status,
          redis: redis.status,
          storage: storage.status,
        },
      });
    }

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorId = logger.error('Health check failed', error as Error, { duration });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: { status: 'down' as const, message: 'Health check error' },
          redis: { status: 'down' as const, message: 'Health check error' },
          storage: { status: 'down' as const, message: 'Health check error' },
        },
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        errorId,
      } as HealthResponse,
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': `${duration}ms`,
        },
      }
    );
  }
}
