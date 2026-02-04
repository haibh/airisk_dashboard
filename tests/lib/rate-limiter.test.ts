/**
 * Rate Limiter Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';
import * as redisClient from '@/lib/redis-client';

// Mock Redis client
vi.mock('@/lib/redis-client', () => ({
  incr: vi.fn(),
  expire: vi.fn(),
  isConnected: vi.fn(),
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(5);

      const result = await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(95); // 100 - 5
      expect(result.resetTime).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should deny request when limit exceeded', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(101);

      const result = await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should set expiration on first request', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(1);

      await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      expect(redisClient.expire).toHaveBeenCalledWith(
        expect.stringContaining('ratelimit:user:123:'),
        expect.any(Number)
      );
    });

    it('should not set expiration on subsequent requests', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(5);

      await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      expect(redisClient.expire).not.toHaveBeenCalled();
    });

    it('should allow all requests when Redis unavailable', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(false);

      const result = await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMITS.DEFAULT.maxRequests);
      expect(redisClient.incr).not.toHaveBeenCalled();
    });

    it('should use sliding window with time-based keys', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(1);

      const now = Date.now();
      const windowKey = Math.floor(now / RATE_LIMITS.DEFAULT.windowMs);

      await checkRateLimit('192.168.1.1', RATE_LIMITS.DEFAULT);

      expect(redisClient.incr).toHaveBeenCalledWith(
        `ratelimit:192.168.1.1:${windowKey}`
      );
    });

    it('should handle different rate limit configs', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(250);

      const result = await checkRateLimit('admin:456', RATE_LIMITS.ADMIN);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(750); // 1000 - 250
    });

    it('should handle errors gracefully and allow request', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockRejectedValue(new Error('Redis error'));

      const result = await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMITS.DEFAULT.maxRequests);
    });

    it('should calculate correct reset time', async () => {
      vi.mocked(redisClient.isConnected).mockReturnValue(true);
      vi.mocked(redisClient.incr).mockResolvedValue(1);

      const now = Date.now();
      const result = await checkRateLimit('user:123', RATE_LIMITS.DEFAULT);

      const expectedWindowKey = Math.floor(now / RATE_LIMITS.DEFAULT.windowMs);
      const expectedResetTime = Math.floor(
        ((expectedWindowKey + 1) * RATE_LIMITS.DEFAULT.windowMs) / 1000
      );

      expect(result.resetTime).toBeGreaterThanOrEqual(expectedResetTime - 1);
      expect(result.resetTime).toBeLessThanOrEqual(expectedResetTime + 1);
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should return correct headers when allowed', () => {
      const result = {
        allowed: true,
        remaining: 95,
        resetTime: 1234567890,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('96'); // remaining + 1 (current request)
      expect(headers['X-RateLimit-Remaining']).toBe('95');
      expect(headers['X-RateLimit-Reset']).toBe('1234567890');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After header when rate limited', () => {
      const futureResetTime = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
      const result = {
        allowed: false,
        remaining: 0,
        resetTime: futureResetTime,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBeDefined();
      const retryAfter = parseInt(headers['Retry-After'], 10);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });

    it('should handle past reset time gracefully', () => {
      const pastResetTime = Math.floor(Date.now() / 1000) - 10; // 10 seconds ago
      const result = {
        allowed: false,
        remaining: 0,
        resetTime: pastResetTime,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['Retry-After']).toBe('0');
    });
  });

  describe('RATE_LIMITS constants', () => {
    it('should have correct default config', () => {
      expect(RATE_LIMITS.DEFAULT).toEqual({
        windowMs: 60000,
        maxRequests: 100,
      });
    });

    it('should have correct authenticated config', () => {
      expect(RATE_LIMITS.AUTHENTICATED).toEqual({
        windowMs: 60000,
        maxRequests: 300,
      });
    });

    it('should have correct admin config', () => {
      expect(RATE_LIMITS.ADMIN).toEqual({
        windowMs: 60000,
        maxRequests: 1000,
      });
    });

    it('should have increasing limits by role', () => {
      expect(RATE_LIMITS.DEFAULT.maxRequests).toBeLessThan(
        RATE_LIMITS.AUTHENTICATED.maxRequests
      );
      expect(RATE_LIMITS.AUTHENTICATED.maxRequests).toBeLessThan(
        RATE_LIMITS.ADMIN.maxRequests
      );
    });
  });
});
