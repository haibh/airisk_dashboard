/**
 * Rate Limiting Module
 *
 * Implements sliding window rate limiting using Redis.
 * Gracefully falls back to allowing all requests if Redis is unavailable.
 */

import { incr, expire, isConnected } from './redis-client';
import { logger } from './logger';

export interface RateLimitConfig {
  windowMs: number;      // Window size in milliseconds
  maxRequests: number;   // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;     // Unix timestamp in seconds
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  DEFAULT: { windowMs: 60000, maxRequests: 100 },          // 100 req/min for unauthenticated
  AUTHENTICATED: { windowMs: 60000, maxRequests: 300 },    // 300 req/min for authenticated users
  ADMIN: { windowMs: 60000, maxRequests: 1000 },           // 1000 req/min for admins
};

/**
 * Check if request is within rate limit using sliding window algorithm
 *
 * @param identifier - Unique identifier (IP address or user ID)
 * @param config - Rate limit configuration (defaults to DEFAULT)
 * @returns Rate limit result with allowed status, remaining requests, and reset time
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): Promise<RateLimitResult> {
  // If Redis is unavailable, allow all requests (graceful degradation)
  if (!isConnected()) {
    logger.debug('Rate limiting skipped - Redis unavailable');
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Math.floor((Date.now() + config.windowMs) / 1000),
    };
  }

  try {
    // Create time-based window key (rounds down to window boundary)
    const now = Date.now();
    const windowKey = Math.floor(now / config.windowMs);
    const redisKey = `ratelimit:${identifier}:${windowKey}`;

    // Increment request count for this window
    const currentCount = await incr(redisKey);

    // Set expiration on first request in window (TTL slightly longer than window for safety)
    if (currentCount === 1) {
      const ttlSeconds = Math.ceil(config.windowMs / 1000) + 1;
      await expire(redisKey, ttlSeconds);
    }

    // Calculate reset time (start of next window)
    const nextWindowStart = (windowKey + 1) * config.windowMs;
    const resetTime = Math.floor(nextWindowStart / 1000);

    // Check if limit exceeded
    const allowed = currentCount <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - currentCount);

    if (!allowed) {
      logger.warn(`Rate limit exceeded for ${identifier}: ${currentCount}/${config.maxRequests}`);
    }

    return {
      allowed,
      remaining,
      resetTime,
    };
  } catch (error) {
    // On error, allow request to prevent blocking legitimate traffic
    logger.error('Rate limit check error:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Math.floor((Date.now() + config.windowMs) / 1000),
    };
  }
}

/**
 * Generate standard rate limit HTTP headers
 *
 * @param result - Rate limit check result
 * @returns Headers object with X-RateLimit-* headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetTime),
  };

  // Add Retry-After header if rate limited
  if (!result.allowed) {
    const retryAfter = Math.max(0, result.resetTime - Math.floor(Date.now() / 1000));
    headers['Retry-After'] = String(retryAfter);
  }

  return headers;
}
