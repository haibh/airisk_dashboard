/**
 * Cache Invalidation Utilities
 *
 * Centralized cache invalidation logic for different entity types.
 * Ensures cache consistency when data changes occur.
 */

import { invalidateCachePattern } from './cache-advanced';
import * as redis from './redis-client';
import { CACHE_KEYS } from './cache-service';
import { logger } from './logger';

// ============================================================================
// Framework Cache Invalidation
// ============================================================================

/**
 * Invalidate all caches related to a specific framework
 * Called when framework or its controls are updated
 */
export async function invalidateOnFrameworkUpdate(frameworkId: string): Promise<void> {
  try {
    await Promise.all([
      // Invalidate specific framework cache
      redis.del(CACHE_KEYS.FRAMEWORK(frameworkId)),
      // Invalidate framework list
      redis.del(CACHE_KEYS.FRAMEWORK_LIST),
      // Invalidate control tree and list for this framework
      redis.del(CACHE_KEYS.CONTROL_TREE(frameworkId)),
      redis.del(CACHE_KEYS.CONTROL_LIST(frameworkId)),
      // Invalidate memory cache pattern
      invalidateCachePattern(`framework:${frameworkId}*`),
      invalidateCachePattern(`controls:*:${frameworkId}*`),
    ]);
    logger.info(`Framework cache invalidated: ${frameworkId}`);
  } catch (error) {
    logger.error(`Failed to invalidate framework cache for ${frameworkId}:`, error);
  }
}

/**
 * Invalidate all framework caches (nuclear option)
 * Use when multiple frameworks are affected
 */
export async function invalidateAllFrameworks(): Promise<void> {
  try {
    await Promise.all([
      invalidateCachePattern('framework:*'),
      invalidateCachePattern('controls:*'),
      redis.del(CACHE_KEYS.FRAMEWORK_LIST),
    ]);
    logger.info('All framework caches invalidated');
  } catch (error) {
    logger.error('Failed to invalidate all framework caches:', error);
  }
}

// ============================================================================
// Assessment Cache Invalidation
// ============================================================================

/**
 * Invalidate all caches related to a specific assessment
 * Called when assessment or its risks are updated
 */
export async function invalidateOnAssessmentChange(
  orgId: string,
  assessmentId: string
): Promise<void> {
  try {
    await Promise.all([
      // Invalidate specific assessment
      redis.del(CACHE_KEYS.ASSESSMENT(assessmentId)),
      // Invalidate assessment list for organization
      redis.del(CACHE_KEYS.ASSESSMENT_LIST(orgId)),
      // Invalidate dashboard caches (stats depend on assessments)
      invalidateOnOrganizationDataChange(orgId),
      // Invalidate memory cache pattern
      invalidateCachePattern(`assessment:${assessmentId}*`),
    ]);
    logger.info(`Assessment cache invalidated: ${assessmentId} (org: ${orgId})`);
  } catch (error) {
    logger.error(`Failed to invalidate assessment cache for ${assessmentId}:`, error);
  }
}

// ============================================================================
// AI System Cache Invalidation
// ============================================================================

/**
 * Invalidate all caches related to a specific AI system
 * Called when AI system is created, updated, or deleted
 */
export async function invalidateOnAISystemChange(orgId: string, systemId: string): Promise<void> {
  try {
    await Promise.all([
      // Invalidate specific AI system
      redis.del(CACHE_KEYS.AI_SYSTEM(systemId)),
      // Invalidate AI system list for organization
      redis.del(CACHE_KEYS.AI_SYSTEM_LIST(orgId)),
      // Invalidate dashboard caches (stats depend on AI systems)
      invalidateOnOrganizationDataChange(orgId),
      // Invalidate memory cache pattern
      invalidateCachePattern(`ai-system:${systemId}*`),
    ]);
    logger.info(`AI system cache invalidated: ${systemId} (org: ${orgId})`);
  } catch (error) {
    logger.error(`Failed to invalidate AI system cache for ${systemId}:`, error);
  }
}

// ============================================================================
// Organization-Wide Cache Invalidation
// ============================================================================

/**
 * Invalidate dashboard and derived data caches for an organization
 * Called when any data that affects dashboard stats changes
 */
export async function invalidateOnOrganizationDataChange(orgId: string): Promise<void> {
  try {
    await Promise.all([
      // Invalidate all dashboard caches
      redis.del(CACHE_KEYS.DASHBOARD_STATS(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_COMPLIANCE(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_HEATMAP(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_ACTIVITY(orgId)),
      // Invalidate memory cache pattern
      invalidateCachePattern(`dashboard:*:${orgId}`),
    ]);
    logger.debug(`Dashboard cache invalidated for org: ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate dashboard cache for org ${orgId}:`, error);
  }
}

/**
 * Invalidate ALL caches for a specific organization (nuclear option)
 * Use when major changes affect all org data
 */
export async function invalidateAllForOrganization(orgId: string): Promise<void> {
  try {
    await Promise.all([
      // Dashboard caches
      redis.del(CACHE_KEYS.DASHBOARD_STATS(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_COMPLIANCE(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_HEATMAP(orgId)),
      redis.del(CACHE_KEYS.DASHBOARD_ACTIVITY(orgId)),
      // Entity list caches
      redis.del(CACHE_KEYS.AI_SYSTEM_LIST(orgId)),
      redis.del(CACHE_KEYS.ASSESSMENT_LIST(orgId)),
      // Pattern-based invalidation for individual entities
      invalidateCachePattern(`ai-system:*`),
      invalidateCachePattern(`assessment:*`),
      invalidateCachePattern(`dashboard:*:${orgId}`),
    ]);
    logger.info(`All caches invalidated for org: ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate all caches for org ${orgId}:`, error);
  }
}

// ============================================================================
// Risk Cache Invalidation
// ============================================================================

/**
 * Invalidate caches when risk data changes
 * Affects assessment and dashboard caches
 */
export async function invalidateOnRiskChange(orgId: string, assessmentId: string): Promise<void> {
  try {
    await Promise.all([
      // Invalidate assessment (includes risks)
      redis.del(CACHE_KEYS.ASSESSMENT(assessmentId)),
      redis.del(CACHE_KEYS.ASSESSMENT_LIST(orgId)),
      // Invalidate dashboard (risk stats)
      invalidateOnOrganizationDataChange(orgId),
    ]);
    logger.info(`Risk cache invalidated for assessment: ${assessmentId}`);
  } catch (error) {
    logger.error(`Failed to invalidate risk cache for assessment ${assessmentId}:`, error);
  }
}

// ============================================================================
// Control Mapping Cache Invalidation
// ============================================================================

/**
 * Invalidate caches when control mappings change
 * Affects framework and control tree caches
 */
export async function invalidateOnControlMappingChange(frameworkId: string): Promise<void> {
  try {
    await invalidateOnFrameworkUpdate(frameworkId);
    logger.info(`Control mapping cache invalidated for framework: ${frameworkId}`);
  } catch (error) {
    logger.error(`Failed to invalidate control mapping cache for framework ${frameworkId}:`, error);
  }
}

// ============================================================================
// Bulk Invalidation Utilities
// ============================================================================

/**
 * Invalidate caches for multiple entities at once
 * Useful for batch operations
 */
export async function invalidateBulkAssessments(
  orgId: string,
  assessmentIds: string[]
): Promise<void> {
  try {
    const promises = assessmentIds.map((id) => redis.del(CACHE_KEYS.ASSESSMENT(id)));
    promises.push(redis.del(CACHE_KEYS.ASSESSMENT_LIST(orgId)));
    promises.push(invalidateOnOrganizationDataChange(orgId));

    await Promise.all(promises);
    logger.info(`Bulk assessment cache invalidated: ${assessmentIds.length} assessments`);
  } catch (error) {
    logger.error('Failed to invalidate bulk assessment caches:', error);
  }
}

/**
 * Invalidate caches for multiple AI systems at once
 */
export async function invalidateBulkAISystems(orgId: string, systemIds: string[]): Promise<void> {
  try {
    const promises = systemIds.map((id) => redis.del(CACHE_KEYS.AI_SYSTEM(id)));
    promises.push(redis.del(CACHE_KEYS.AI_SYSTEM_LIST(orgId)));
    promises.push(invalidateOnOrganizationDataChange(orgId));

    await Promise.all(promises);
    logger.info(`Bulk AI system cache invalidated: ${systemIds.length} systems`);
  } catch (error) {
    logger.error('Failed to invalidate bulk AI system caches:', error);
  }
}

// ============================================================================
// Task Cache Invalidation
// ============================================================================

/**
 * Invalidate dashboard caches when tasks change
 * Affects pending actions count in dashboard stats
 */
export async function invalidateOnTaskChange(orgId: string): Promise<void> {
  try {
    await redis.del(CACHE_KEYS.DASHBOARD_STATS(orgId));
    logger.debug(`Task change triggered dashboard stats cache invalidation for org: ${orgId}`);
  } catch (error) {
    logger.error(`Failed to invalidate task cache for org ${orgId}:`, error);
  }
}
