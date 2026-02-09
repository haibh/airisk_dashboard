/**
 * Organization Storage Quota Service
 * Manages storage quotas and usage tracking for organizations
 */

import { prisma } from './db';
import { logger } from './logger';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024 * 1024; // 5GB default quota

interface StorageUsage {
  usedBytes: number;
  maxBytes: number;
  percentage: number;
  fileCount: number;
}

/**
 * Get current storage usage for an organization
 * @param orgId - Organization ID
 * @returns Storage usage statistics
 */
export async function getStorageUsage(orgId: string): Promise<StorageUsage> {
  try {
    // Aggregate file sizes from Evidence table
    const result = await prisma.evidence.aggregate({
      where: { organizationId: orgId },
      _sum: { fileSize: true },
      _count: { id: true },
    });

    const usedBytes = result._sum.fileSize || 0;
    const fileCount = result._count.id || 0;

    // Get organization quota from settings
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { settings: true },
    });

    // Extract quota from settings (stored as JSON)
    const maxBytes =
      (organization?.settings as any)?.storageQuota?.maxBytes || DEFAULT_MAX_BYTES;

    const percentage = maxBytes > 0 ? (usedBytes / maxBytes) * 100 : 0;

    logger.debug('Storage usage calculated', {
      context: 'StorageQuotaService',
      data: { orgId, usedBytes, maxBytes, fileCount, percentage },
    });

    return {
      usedBytes,
      maxBytes,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
      fileCount,
    };
  } catch (error) {
    logger.error('Failed to get storage usage', error, {
      context: 'StorageQuotaService',
      data: { orgId },
    });
    throw error;
  }
}

/**
 * Check if additional storage is allowed without exceeding quota
 * @param orgId - Organization ID
 * @param additionalBytes - Number of bytes to add
 * @returns Object with allowed status and remaining bytes
 */
export async function checkQuota(
  orgId: string,
  additionalBytes: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const usage = await getStorageUsage(orgId);
    const newTotal = usage.usedBytes + additionalBytes;
    const remaining = usage.maxBytes - usage.usedBytes;
    const allowed = newTotal <= usage.maxBytes;

    logger.debug('Quota check performed', {
      context: 'StorageQuotaService',
      data: { orgId, additionalBytes, allowed, remaining },
    });

    return { allowed, remaining };
  } catch (error) {
    logger.error('Failed to check quota', error, {
      context: 'StorageQuotaService',
      data: { orgId, additionalBytes },
    });
    throw error;
  }
}

/**
 * Update storage usage (no-op function for API consistency)
 * Usage is calculated in real-time from Evidence records
 * @param orgId - Organization ID
 * @param deltaBytes - Change in bytes (positive or negative)
 */
export async function updateUsage(orgId: string, deltaBytes: number): Promise<void> {
  // No-op: We calculate usage from actual Evidence records
  // This ensures accuracy and prevents drift from tracking deltas
  logger.debug('updateUsage called (no-op)', {
    context: 'StorageQuotaService',
    data: { orgId, deltaBytes },
  });
}
