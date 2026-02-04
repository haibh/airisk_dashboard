/**
 * GET /api/gap-analysis - Run gap analysis across frameworks
 * Requires ASSESSOR+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { runGapAnalysis, runPairwiseComparison } from '@/lib/gap-analysis-engine';

// Simple in-memory cache with TTL
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if valid
 */
function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache entry
 */
function setCached(key: string, data: unknown): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - ASSESSOR or higher
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Assessor role or higher required');
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'multi';

    // Pairwise comparison mode
    if (mode === 'pairwise') {
      const sourceId = searchParams.get('source');
      const targetId = searchParams.get('target');

      if (!sourceId || !targetId) {
        return validationError('source and target framework IDs are required for pairwise mode');
      }

      if (sourceId === targetId) {
        return validationError('source and target must be different frameworks');
      }

      const pairwiseCacheKey = `gap-pairwise:${sourceId}:${targetId}`;
      const pairwiseCached = getCached(pairwiseCacheKey);

      if (pairwiseCached) {
        return NextResponse.json({ ...pairwiseCached, cached: true });
      }

      const pairwiseResult = await runPairwiseComparison(sourceId, targetId);
      setCached(pairwiseCacheKey, pairwiseResult);

      return NextResponse.json(pairwiseResult);
    }

    // Multi-framework mode
    const frameworksParam = searchParams.get('frameworks');

    if (!frameworksParam || frameworksParam.trim() === '') {
      return validationError('frameworks parameter is required');
    }

    const frameworkIds = frameworksParam.split(',').filter(Boolean);

    if (frameworkIds.length === 0) {
      return validationError('At least one framework ID is required');
    }

    if (frameworkIds.length > 10) {
      return validationError('Maximum 10 frameworks allowed');
    }

    // Check cache
    const cacheKey = `gap-analysis:${session.user.organizationId}:${frameworkIds.sort().join(',')}`;
    const cached = getCached(cacheKey);

    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // Run gap analysis
    const result = await runGapAnalysis(session.user.organizationId, frameworkIds);

    // Cache result
    setCached(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'running gap analysis');
  }
}
