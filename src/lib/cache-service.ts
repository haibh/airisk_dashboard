/**
 * Cache Service
 *
 * High-level caching utilities with domain-specific functions and TTL presets.
 * Provides type-safe caching for frameworks, dashboards, and controls.
 */

import * as redis from './redis-client';
import { logger } from './logger';

/**
 * Cache key patterns for different data types
 */
export const CACHE_KEYS = {
  FRAMEWORK: (id: string) => `framework:${id}`,
  FRAMEWORK_LIST: 'frameworks:list',
  DASHBOARD_STATS: (orgId: string) => `dashboard:stats:${orgId}`,
  DASHBOARD_COMPLIANCE: (orgId: string) => `dashboard:compliance:${orgId}`,
  DASHBOARD_HEATMAP: (orgId: string) => `dashboard:heatmap:${orgId}`,
  DASHBOARD_ACTIVITY: (orgId: string) => `dashboard:activity:${orgId}`,
  CONTROL_TREE: (frameworkId: string) => `controls:tree:${frameworkId}`,
  CONTROL_LIST: (frameworkId: string) => `controls:list:${frameworkId}`,
  AI_SYSTEM: (id: string) => `ai-system:${id}`,
  AI_SYSTEM_LIST: (orgId: string) => `ai-systems:org:${orgId}`,
  ASSESSMENT: (id: string) => `assessment:${id}`,
  ASSESSMENT_LIST: (orgId: string) => `assessments:org:${orgId}`,
} as const;

/**
 * TTL presets in seconds
 */
export const TTL = {
  FRAMEWORK: 3600, // 1 hour - frameworks change infrequently
  DASHBOARD: 300, // 5 minutes - dashboards need fresher data
  CONTROL_TREE: 3600, // 1 hour - control hierarchy is stable
  AI_SYSTEM: 1800, // 30 minutes - moderate update frequency
  ASSESSMENT: 900, // 15 minutes - assessments change more often
  SHORT: 60, // 1 minute - for volatile data
  MEDIUM: 600, // 10 minutes
  LONG: 7200, // 2 hours
} as const;

// ============================================================================
// Framework Caching
// ============================================================================

/**
 * Cache a single framework
 */
export async function cacheFramework(id: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.FRAMEWORK(id), data, TTL.FRAMEWORK);
  } catch (error) {
    logger.error(`Failed to cache framework ${id}:`, error);
  }
}

/**
 * Get cached framework
 */
export async function getCachedFramework<T>(id: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.FRAMEWORK(id));
  } catch (error) {
    logger.error(`Failed to get cached framework ${id}:`, error);
    return null;
  }
}

/**
 * Cache framework list
 */
export async function cacheFrameworkList(data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.FRAMEWORK_LIST, data, TTL.FRAMEWORK);
  } catch (error) {
    logger.error('Failed to cache framework list:', error);
  }
}

/**
 * Get cached framework list
 */
export async function getCachedFrameworkList<T>(): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.FRAMEWORK_LIST);
  } catch (error) {
    logger.error('Failed to get cached framework list:', error);
    return null;
  }
}

// ============================================================================
// Dashboard Caching
// ============================================================================

/**
 * Cache dashboard statistics
 */
export async function cacheDashboardStats(orgId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.DASHBOARD_STATS(orgId), data, TTL.DASHBOARD);
  } catch (error) {
    logger.error(`Failed to cache dashboard stats for org ${orgId}:`, error);
  }
}

/**
 * Get cached dashboard statistics
 */
export async function getCachedDashboardStats<T>(orgId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.DASHBOARD_STATS(orgId));
  } catch (error) {
    logger.error(`Failed to get cached dashboard stats for org ${orgId}:`, error);
    return null;
  }
}

/**
 * Cache dashboard compliance data
 */
export async function cacheDashboardCompliance(orgId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.DASHBOARD_COMPLIANCE(orgId), data, TTL.DASHBOARD);
  } catch (error) {
    logger.error(`Failed to cache dashboard compliance for org ${orgId}:`, error);
  }
}

/**
 * Get cached dashboard compliance data
 */
export async function getCachedDashboardCompliance<T>(orgId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.DASHBOARD_COMPLIANCE(orgId));
  } catch (error) {
    logger.error(`Failed to get cached dashboard compliance for org ${orgId}:`, error);
    return null;
  }
}

/**
 * Cache dashboard risk heatmap
 */
export async function cacheDashboardHeatmap(orgId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.DASHBOARD_HEATMAP(orgId), data, TTL.DASHBOARD);
  } catch (error) {
    logger.error(`Failed to cache dashboard heatmap for org ${orgId}:`, error);
  }
}

/**
 * Get cached dashboard risk heatmap
 */
export async function getCachedDashboardHeatmap<T>(orgId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.DASHBOARD_HEATMAP(orgId));
  } catch (error) {
    logger.error(`Failed to get cached dashboard heatmap for org ${orgId}:`, error);
    return null;
  }
}

/**
 * Cache dashboard activity feed
 */
export async function cacheDashboardActivity(orgId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.DASHBOARD_ACTIVITY(orgId), data, TTL.DASHBOARD);
  } catch (error) {
    logger.error(`Failed to cache dashboard activity for org ${orgId}:`, error);
  }
}

/**
 * Get cached dashboard activity feed
 */
export async function getCachedDashboardActivity<T>(orgId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.DASHBOARD_ACTIVITY(orgId));
  } catch (error) {
    logger.error(`Failed to get cached dashboard activity for org ${orgId}:`, error);
    return null;
  }
}

// ============================================================================
// Control Caching
// ============================================================================

/**
 * Cache control tree for framework
 */
export async function cacheControlTree(frameworkId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.CONTROL_TREE(frameworkId), data, TTL.CONTROL_TREE);
  } catch (error) {
    logger.error(`Failed to cache control tree for framework ${frameworkId}:`, error);
  }
}

/**
 * Get cached control tree
 */
export async function getCachedControlTree<T>(frameworkId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.CONTROL_TREE(frameworkId));
  } catch (error) {
    logger.error(`Failed to get cached control tree for framework ${frameworkId}:`, error);
    return null;
  }
}

/**
 * Cache control list for framework
 */
export async function cacheControlList(frameworkId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.CONTROL_LIST(frameworkId), data, TTL.CONTROL_TREE);
  } catch (error) {
    logger.error(`Failed to cache control list for framework ${frameworkId}:`, error);
  }
}

/**
 * Get cached control list
 */
export async function getCachedControlList<T>(frameworkId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.CONTROL_LIST(frameworkId));
  } catch (error) {
    logger.error(`Failed to get cached control list for framework ${frameworkId}:`, error);
    return null;
  }
}

// ============================================================================
// AI System Caching
// ============================================================================

/**
 * Cache AI system
 */
export async function cacheAISystem(id: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.AI_SYSTEM(id), data, TTL.AI_SYSTEM);
  } catch (error) {
    logger.error(`Failed to cache AI system ${id}:`, error);
  }
}

/**
 * Get cached AI system
 */
export async function getCachedAISystem<T>(id: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.AI_SYSTEM(id));
  } catch (error) {
    logger.error(`Failed to get cached AI system ${id}:`, error);
    return null;
  }
}

/**
 * Cache AI system list for organization
 */
export async function cacheAISystemList(orgId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.AI_SYSTEM_LIST(orgId), data, TTL.AI_SYSTEM);
  } catch (error) {
    logger.error(`Failed to cache AI system list for org ${orgId}:`, error);
  }
}

/**
 * Get cached AI system list
 */
export async function getCachedAISystemList<T>(orgId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.AI_SYSTEM_LIST(orgId));
  } catch (error) {
    logger.error(`Failed to get cached AI system list for org ${orgId}:`, error);
    return null;
  }
}

// ============================================================================
// Assessment Caching
// ============================================================================

/**
 * Cache risk assessment
 */
export async function cacheAssessment(id: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.ASSESSMENT(id), data, TTL.ASSESSMENT);
  } catch (error) {
    logger.error(`Failed to cache assessment ${id}:`, error);
  }
}

/**
 * Get cached risk assessment
 */
export async function getCachedAssessment<T>(id: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.ASSESSMENT(id));
  } catch (error) {
    logger.error(`Failed to get cached assessment ${id}:`, error);
    return null;
  }
}

/**
 * Cache assessment list for organization
 */
export async function cacheAssessmentList(orgId: string, data: unknown): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.ASSESSMENT_LIST(orgId), data, TTL.ASSESSMENT);
  } catch (error) {
    logger.error(`Failed to cache assessment list for org ${orgId}:`, error);
  }
}

/**
 * Get cached assessment list
 */
export async function getCachedAssessmentList<T>(orgId: string): Promise<T | null> {
  try {
    return await redis.get<T>(CACHE_KEYS.ASSESSMENT_LIST(orgId));
  } catch (error) {
    logger.error(`Failed to get cached assessment list for org ${orgId}:`, error);
    return null;
  }
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Invalidate cache by pattern
 * @param pattern - Redis key pattern (e.g., "framework:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    await redis.deletePattern(pattern);
    logger.info(`Cache invalidated: ${pattern}`);
  } catch (error) {
    logger.error(`Failed to invalidate cache pattern ${pattern}:`, error);
  }
}

/**
 * Invalidate all framework-related caches
 */
export async function invalidateFrameworkCache(): Promise<void> {
  try {
    await Promise.all([
      redis.deletePattern('framework:*'),
      redis.del(CACHE_KEYS.FRAMEWORK_LIST),
      redis.deletePattern('controls:*'),
    ]);
    logger.info('Framework cache invalidated');
  } catch (error) {
    logger.error('Failed to invalidate framework cache:', error);
  }
}

/**
 * Invalidate all dashboard caches for organization
 */
export async function invalidateDashboardCache(orgId: string): Promise<void> {
  try {
    await Promise.all([
      redis.del(CACHE_KEYS.DASHBOARD_STATS(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_COMPLIANCE(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_HEATMAP(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_ACTIVITY(orgId)),
    ]);
    logger.info(`Dashboard cache invalidated for org ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate dashboard cache for org ${orgId}:`, error);
  }
}

/**
 * Invalidate AI system caches for organization
 */
export async function invalidateAISystemCache(orgId: string): Promise<void> {
  try {
    await Promise.all([
      redis.deletePattern(`ai-system:*`),
      redis.del(CACHE_KEYS.AI_SYSTEM_LIST(orgId)),
    ]);
    logger.info(`AI system cache invalidated for org ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate AI system cache for org ${orgId}:`, error);
  }
}

/**
 * Invalidate assessment caches for organization
 */
export async function invalidateAssessmentCache(orgId: string): Promise<void> {
  try {
    await Promise.all([
      redis.deletePattern(`assessment:*`),
      redis.del(CACHE_KEYS.ASSESSMENT_LIST(orgId)),
    ]);
    logger.info(`Assessment cache invalidated for org ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate assessment cache for org ${orgId}:`, error);
  }
}

/**
 * Invalidate all caches for organization (nuclear option)
 */
export async function invalidateAllOrgCache(orgId: string): Promise<void> {
  try {
    await Promise.all([
      invalidateDashboardCache(orgId),
      invalidateAISystemCache(orgId),
      invalidateAssessmentCache(orgId),
    ]);
    logger.info(`All caches invalidated for org ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate all caches for org ${orgId}:`, error);
  }
}

/**
 * Check if Redis is available for caching
 */
export function isCacheAvailable(): boolean {
  return redis.isConnected();
}
