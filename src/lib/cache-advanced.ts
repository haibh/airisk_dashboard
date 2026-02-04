/**
 * Advanced Caching Strategies
 *
 * Multi-layer caching with in-memory LRU cache and stale-while-revalidate support.
 * Provides improved performance for hot data and graceful degradation.
 */

import * as redis from './redis-client';
import { logger } from './logger';

// ============================================================================
// Cache Options & Types
// ============================================================================

export interface CacheOptions {
  ttl: number; // TTL in seconds
  staleWhileRevalidate?: boolean; // Serve stale while refreshing in background
  staleTTL?: number; // How long stale data is acceptable (seconds)
  useMemoryCache?: boolean; // Use in-memory LRU cache (default: true)
}

interface CachedValue<T> {
  value: T;
  expires: number; // timestamp in ms
  staleUntil?: number; // timestamp in ms (if staleWhileRevalidate enabled)
}

// ============================================================================
// In-Memory LRU Cache
// ============================================================================

/**
 * Simple in-memory LRU cache for hot data
 * Stores recently accessed items to reduce Redis calls
 */
class InMemoryCache {
  private cache: Map<string, CachedValue<unknown>>;
  private accessOrder: string[]; // Track access order for LRU eviction
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.accessOrder = [];
    this.maxSize = maxSize;
  }

  /**
   * Get value from in-memory cache
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const now = Date.now();

    // Check if stale but within stale window
    if (cached.staleUntil && now < cached.staleUntil) {
      this.updateAccessOrder(key);
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Memory cache HIT (stale): ${key}`);
      }
      return cached.value as T;
    }

    // Check if still fresh
    if (now < cached.expires) {
      this.updateAccessOrder(key);
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Memory cache HIT: ${key}`);
      }
      return cached.value as T;
    }

    // Expired, remove from cache
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    return null;
  }

  /**
   * Set value in in-memory cache
   */
  set(key: string, value: unknown, ttlMs: number, staleTTLMs?: number): void {
    const now = Date.now();
    const expires = now + ttlMs;
    const staleUntil = staleTTLMs ? now + staleTTLMs : undefined;

    this.cache.set(key, { value, expires, staleUntil });
    this.updateAccessOrder(key);

    // Evict LRU items if over max size
    if (this.cache.size > this.maxSize) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Memory cache EVICT: ${lruKey}`);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Memory cache SET: ${key} (TTL: ${ttlMs}ms)`);
    }
  }

  /**
   * Delete value from in-memory cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    logger.debug('Memory cache CLEARED');
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Singleton in-memory cache instance
const memoryCache = new InMemoryCache(100);

// ============================================================================
// Multi-Layer Cache Wrapper
// ============================================================================

/**
 * Get value from cache with multi-layer support and stale-while-revalidate
 *
 * @param key - Cache key
 * @param fetcher - Function to fetch fresh data if cache miss
 * @param options - Cache options (TTL, stale-while-revalidate, etc.)
 * @returns Cached or freshly fetched value
 */
export async function getFromCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const {
    ttl,
    staleWhileRevalidate = false,
    staleTTL = ttl * 2, // Default: stale data valid for 2x TTL
    useMemoryCache = true,
  } = options;

  // Layer 1: Try in-memory cache first (if enabled)
  if (useMemoryCache) {
    const memCached = memoryCache.get<T>(key);
    if (memCached !== null) {
      return memCached;
    }
  }

  // Layer 2: Try Redis cache
  try {
    if (redis.isConnected()) {
      const redisCached = await redis.get<T>(key);
      if (redisCached !== null) {
        // Populate memory cache for next access
        if (useMemoryCache) {
          memoryCache.set(
            key,
            redisCached,
            ttl * 1000,
            staleWhileRevalidate ? staleTTL * 1000 : undefined
          );
        }
        return redisCached;
      }
    }
  } catch (error) {
    logger.error(`Redis GET error for key ${key}:`, error);
    // Continue to fetcher on Redis error
  }

  // Cache miss: fetch fresh data
  try {
    const freshData = await fetcher();

    // Store in Redis (async, don't block return)
    if (redis.isConnected()) {
      redis.set(key, freshData, ttl).catch((err) => {
        logger.error(`Failed to cache data for key ${key}:`, err);
      });
    }

    // Store in memory cache
    if (useMemoryCache) {
      memoryCache.set(
        key,
        freshData,
        ttl * 1000,
        staleWhileRevalidate ? staleTTL * 1000 : undefined
      );
    }

    return freshData;
  } catch (error) {
    logger.error(`Fetcher error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Invalidate cache for specific key
 * Clears from both memory and Redis
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    // Clear from memory cache
    memoryCache.delete(key);

    // Clear from Redis
    await redis.del(key);

    logger.info(`Cache invalidated: ${key}`);
  } catch (error) {
    logger.error(`Failed to invalidate cache for key ${key}:`, error);
  }
}

/**
 * Invalidate cache by pattern
 * Clears all keys matching pattern from Redis (memory cache cleared on next access)
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    // Clear entire memory cache (simpler than pattern matching)
    memoryCache.clear();

    // Clear from Redis
    await redis.deletePattern(pattern);

    logger.info(`Cache pattern invalidated: ${pattern}`);
  } catch (error) {
    logger.error(`Failed to invalidate cache pattern ${pattern}:`, error);
  }
}

/**
 * Warm cache by pre-loading data
 * Useful for frequently accessed data on app startup
 *
 * @param entries - Map of cache keys to their fetcher functions
 */
export async function warmCache(entries: Map<string, () => Promise<unknown>>): Promise<void> {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  logger.info(`Starting cache warming for ${entries.size} entries...`);

  // Warm caches in parallel
  const promises = Array.from(entries.entries()).map(async ([key, fetcher]) => {
    try {
      const data = await fetcher();

      // Store in Redis
      if (redis.isConnected()) {
        await redis.set(key, data, 3600); // Default 1 hour TTL for warming
      }

      // Store in memory cache
      memoryCache.set(key, data, 3600 * 1000);

      successCount++;
      logger.debug(`Cache warmed: ${key}`);
    } catch (error) {
      errorCount++;
      logger.error(`Failed to warm cache for key ${key}:`, error);
    }
  });

  await Promise.all(promises);

  const duration = Date.now() - startTime;
  logger.info(
    `Cache warming completed in ${duration}ms: ${successCount} success, ${errorCount} errors`
  );
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memory: memoryCache.getStats(),
    redis: {
      connected: redis.isConnected(),
    },
  };
}

/**
 * Clear all caches (memory and Redis)
 * Use with caution - nuclear option for testing/debugging
 */
export async function clearAllCaches(): Promise<void> {
  try {
    memoryCache.clear();
    logger.info('All caches cleared');
  } catch (error) {
    logger.error('Failed to clear caches:', error);
  }
}
