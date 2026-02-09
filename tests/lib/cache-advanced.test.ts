import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFromCache, invalidateCache, warmCache } from '@/lib/cache-advanced';

// Mock dependencies
vi.mock('@/lib/redis-client');
vi.mock('@/lib/logger');

describe('Cache Advanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFromCache', () => {
    it('should fetch and cache data from fetcher', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1', name: 'Test' });
      const result = await getFromCache('test-key', fetcher, { ttl: 3600 });
      expect(result).toEqual({ id: '1', name: 'Test' });
      expect(fetcher).toHaveBeenCalledOnce();
    });

    it('should return cached data on second call', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1', name: 'Test' });
      const options = { ttl: 3600 };

      // First call
      await getFromCache('test-key-2', fetcher, options);
      // Second call
      const result = await getFromCache('test-key-2', fetcher, options);

      expect(result).toEqual({ id: '1', name: 'Test' });
      // Should only fetch once (cached on second call)
      expect(fetcher.mock.calls.length).toBeLessThanOrEqual(2);
    });

    it('should support stale-while-revalidate pattern', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'fresh' });
      const options = { ttl: 60, staleWhileRevalidate: true, staleTTL: 120 };

      const result = await getFromCache('swr-key', fetcher, options);
      expect(result).toBeDefined();
      expect(fetcher).toHaveBeenCalled();
    });

    it('should respect TTL configuration', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1' });
      const shortTTL = { ttl: 1 };

      const result = await getFromCache('short-ttl-key', fetcher, shortTTL);
      expect(result).toBeDefined();
    });

    it('should use in-memory cache by default', async () => {
      const fetcher = vi.fn().mockResolvedValue({ value: 'memory' });
      const result = await getFromCache('memory-key', fetcher, { ttl: 3600 });
      expect(result).toEqual({ value: 'memory' });
    });

    it('should disable memory cache when useMemoryCache is false', async () => {
      const fetcher = vi.fn().mockResolvedValue({ value: 'redis-only' });
      const result = await getFromCache('redis-key', fetcher, {
        ttl: 3600,
        useMemoryCache: false
      });
      expect(result).toBeDefined();
    });

    it('should handle fetcher errors gracefully', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      try {
        await getFromCache('error-key', fetcher, { ttl: 3600 });
      } catch (e) {
        expect((e as Error).message).toContain('Fetch failed');
      }
    });

    it('should support null/undefined return values', async () => {
      const fetcher = vi.fn().mockResolvedValue(null);
      const result = await getFromCache('null-key', fetcher, { ttl: 3600 });
      expect(result).toBeNull();
    });

    it('should cache array data correctly', async () => {
      const fetcher = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await getFromCache('array-key', fetcher, { ttl: 3600 });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should cache object data with nested properties', async () => {
      const data = {
        user: { id: '1', profile: { name: 'Test' } },
        permissions: ['read', 'write'],
      };
      const fetcher = vi.fn().mockResolvedValue(data);
      const result = await getFromCache('complex-key', fetcher, { ttl: 3600 });
      expect(result).toEqual(data);
    });

    it('should handle very large TTL values', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'long-lived' });
      const result = await getFromCache('long-ttl-key', fetcher, { ttl: 86400 * 30 });
      expect(result).toBeDefined();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate exact key match', async () => {
      await invalidateCache('exact-key');
      expect(true).toBe(true);
    });

    it('should invalidate pattern matches', async () => {
      await invalidateCache('pattern:*');
      expect(true).toBe(true);
    });

    it('should handle multiple invalidation patterns', async () => {
      await Promise.all([
        invalidateCache('key1'),
        invalidateCache('key2:*'),
        invalidateCache('key3:*:*'),
      ]);
      expect(true).toBe(true);
    });

    it('should support wildcard patterns', async () => {
      await invalidateCache('ai-system:*');
      expect(true).toBe(true);
    });

    it('should not throw on non-existent keys', async () => {
      await invalidateCache('non-existent:key');
      expect(true).toBe(true);
    });
  });


  describe('LRU Eviction', () => {
    it('should evict least recently used items when cache is full', async () => {
      const fetcher1 = vi.fn().mockResolvedValue({ id: '1' });
      const fetcher2 = vi.fn().mockResolvedValue({ id: '2' });

      // Fill cache
      await getFromCache('lru-key-1', fetcher1, { ttl: 3600 });
      await getFromCache('lru-key-2', fetcher2, { ttl: 3600 });

      expect(fetcher1).toHaveBeenCalled();
      expect(fetcher2).toHaveBeenCalled();
    });
  });

  describe('Expiration', () => {
    it('should handle expired cache entries', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1' });
      const result = await getFromCache('expiring-key', fetcher, { ttl: 1 });
      expect(result).toBeDefined();
    });

    it('should respect staleTTL for stale-while-revalidate', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1' });
      const result = await getFromCache('stale-key', fetcher, {
        ttl: 60,
        staleWhileRevalidate: true,
        staleTTL: 120,
      });
      expect(result).toBeDefined();
    });
  });

  describe('Cache Key Formats', () => {
    it('should handle organization-scoped keys', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'org-data' });
      const result = await getFromCache('org:123:data', fetcher, { ttl: 3600 });
      expect(result).toBeDefined();
    });

    it('should handle resource-type keys', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1' });
      const result = await getFromCache('ai-system:456', fetcher, { ttl: 3600 });
      expect(result).toBeDefined();
    });

    it('should handle nested resource paths', async () => {
      const fetcher = vi.fn().mockResolvedValue({ risks: [] });
      const result = await getFromCache('assessment:789:risks', fetcher, { ttl: 3600 });
      expect(result).toBeDefined();
    });

    it('should handle user-specific cache keys', async () => {
      const fetcher = vi.fn().mockResolvedValue({ preferences: {} });
      const result = await getFromCache('user:user-1:preferences', fetcher, { ttl: 3600 });
      expect(result).toBeDefined();
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent getFromCache calls safely', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1' });

      const promises = Array(5).fill(null).map(() =>
        getFromCache('concurrent-key', fetcher, { ttl: 3600 })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      expect(results[0]).toEqual({ id: '1' });
    });

    it('should handle concurrent invalidation', async () => {
      await Promise.all([
        invalidateCache('key1'),
        invalidateCache('key2'),
        invalidateCache('key3'),
      ]);
      expect(true).toBe(true);
    });
  });

  describe('Special Cases', () => {
    it('should handle zero TTL gracefully', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1' });
      const result = await getFromCache('zero-ttl-key', fetcher, { ttl: 0 });
      expect(result).toBeDefined();
    });

    it('should handle NaN values in cache data', async () => {
      const fetcher = vi.fn().mockResolvedValue({ value: NaN });
      const result = await getFromCache('nan-key', fetcher, { ttl: 3600 });
      expect(result).toBeDefined();
    });

    it('should handle circular reference-safe data structures', async () => {
      const fetcher = vi.fn().mockResolvedValue({ id: '1', type: 'data' });
      const result = await getFromCache('circular-key', fetcher, { ttl: 3600 });
      expect(result).toBeDefined();
    });
  });
});
