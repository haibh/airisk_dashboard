/**
 * API Route: List all frameworks
 * GET /api/frameworks
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/api-error-handler';
import { getFromCache } from '@/lib/cache-advanced';
import { CACHE_KEYS, TTL } from '@/lib/cache-service';

export async function GET() {
  try {
    // Use advanced caching with stale-while-revalidate
    const frameworks = await getFromCache(
      CACHE_KEYS.FRAMEWORK_LIST,
      async () => {
        return await prisma.framework.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: { controls: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      },
      {
        ttl: TTL.FRAMEWORK, // 1 hour
        staleWhileRevalidate: true,
        staleTTL: TTL.FRAMEWORK * 2, // Serve stale for 2 hours while refreshing
      }
    );

    return NextResponse.json(frameworks);
  } catch (error) {
    return handleApiError(error, 'fetching frameworks');
  }
}
