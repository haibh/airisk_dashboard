/**
 * Redis Client Singleton
 *
 * Provides connection management and core Redis operations with graceful fallback.
 * When Redis is unavailable, operations log warnings and return null/false to prevent app crashes.
 */

import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

/**
 * Initialize Redis connection
 * Gracefully handles connection failures without crashing the app
 */
function initRedis(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('REDIS_URL not configured. Running without cache.');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Redis retry attempt ${times}, delay ${delay}ms`);
        return delay;
      },
      reconnectOnError(err) {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        if (targetErrors.some(e => err.message.includes(e))) {
          logger.warn(`Redis reconnecting due to: ${err.message}`);
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
      isRedisAvailable = false;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    return null;
  }
}

/**
 * Get Redis client instance
 * @returns Redis client or null if unavailable
 */
function getClient(): Redis | null {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
}

/**
 * Check if Redis is currently connected and available
 */
export function isConnected(): boolean {
  return isRedisAvailable && redisClient !== null && redisClient.status === 'ready';
}

/**
 * Get value from Redis cache
 * @param key - Cache key
 * @returns Parsed value or null if not found or Redis unavailable
 */
export async function get<T>(key: string): Promise<T | null> {
  const client = getClient();
  if (!client || !isConnected()) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Cache MISS (Redis unavailable): ${key}`);
    }
    return null;
  }

  try {
    const value = await client.get(key);
    if (!value) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Cache MISS: ${key}`);
      }
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Cache HIT: ${key}`);
    }
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set value in Redis cache
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttlSeconds - Time to live in seconds (optional)
 */
export async function set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const client = getClient();
  if (!client || !isConnected()) {
    logger.debug(`Cache SET skipped (Redis unavailable): ${key}`);
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds || 'none'}s)`);
    }
  } catch (error) {
    logger.error(`Redis SET error for key ${key}:`, error);
  }
}

/**
 * Delete key from Redis cache
 * @param key - Cache key to delete
 */
export async function del(key: string): Promise<void> {
  const client = getClient();
  if (!client || !isConnected()) {
    return;
  }

  try {
    await client.del(key);
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Cache DEL: ${key}`);
    }
  } catch (error) {
    logger.error(`Redis DEL error for key ${key}:`, error);
  }
}

/**
 * Increment numeric value in Redis
 * @param key - Cache key
 * @returns New value after increment, or 0 if Redis unavailable
 */
export async function incr(key: string): Promise<number> {
  const client = getClient();
  if (!client || !isConnected()) {
    return 0;
  }

  try {
    const value = await client.incr(key);
    return value;
  } catch (error) {
    logger.error(`Redis INCR error for key ${key}:`, error);
    return 0;
  }
}

/**
 * Set expiration time on key
 * @param key - Cache key
 * @param ttlSeconds - Time to live in seconds
 */
export async function expire(key: string, ttlSeconds: number): Promise<void> {
  const client = getClient();
  if (!client || !isConnected()) {
    return;
  }

  try {
    await client.expire(key, ttlSeconds);
  } catch (error) {
    logger.error(`Redis EXPIRE error for key ${key}:`, error);
  }
}

/**
 * Check if key exists in Redis
 * @param key - Cache key
 * @returns True if exists, false otherwise or if Redis unavailable
 */
export async function exists(key: string): Promise<boolean> {
  const client = getClient();
  if (!client || !isConnected()) {
    return false;
  }

  try {
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Redis EXISTS error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete all keys matching pattern
 * @param pattern - Redis key pattern (e.g., "dashboard:*")
 */
export async function deletePattern(pattern: string): Promise<void> {
  const client = getClient();
  if (!client || !isConnected()) {
    return;
  }

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      }
    }
  } catch (error) {
    logger.error(`Redis DELETE PATTERN error for ${pattern}:`, error);
  }
}

/**
 * Gracefully close Redis connection
 * Call this during app shutdown
 */
export async function closeConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    } finally {
      redisClient = null;
      isRedisAvailable = false;
    }
  }
}

// Initialize Redis on module load
initRedis();
