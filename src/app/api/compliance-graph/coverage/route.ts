/**
 * GET /api/compliance-graph/coverage
 * Returns compliance chain coverage statistics per framework
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { calculateCoverageStats, type FrameworkCoverage } from '@/lib/compliance-chain-builder';
import { z } from 'zod';

const querySchema = z.object({
  frameworkId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      frameworkId: searchParams.get('frameworkId') || undefined,
    });

    // Get frameworks to analyze
    const frameworkWhere = query.frameworkId ? { id: query.frameworkId } : {};
    const frameworks = await prisma.framework.findMany({
      where: frameworkWhere,
      include: {
        _count: {
          select: { controls: true },
        },
      },
    });

    const frameworkCoverages: FrameworkCoverage[] = [];

    for (const framework of frameworks) {
      // Get compliance chains for this framework's controls
      const chains = await prisma.complianceChain.findMany({
        where: {
          organizationId: session.user.organizationId,
          control: {
            frameworkId: framework.id,
          },
        },
      });

      // Calculate coverage
      const stats = calculateCoverageStats(chains, framework._count.controls);

      frameworkCoverages.push({
        id: framework.id,
        name: framework.name,
        total: stats.total,
        complete: stats.complete,
        partial: stats.partial,
        missing: stats.missing,
        coveragePercent: stats.coveragePercent,
      });
    }

    // Calculate overall stats
    const overall = {
      total: frameworkCoverages.reduce((sum, f) => sum + f.total, 0),
      complete: frameworkCoverages.reduce((sum, f) => sum + f.complete, 0),
      partial: frameworkCoverages.reduce((sum, f) => sum + f.partial, 0),
      missing: frameworkCoverages.reduce((sum, f) => sum + f.missing, 0),
      coveragePercent: 0,
    };

    overall.coveragePercent = overall.total > 0
      ? Math.round((overall.complete / overall.total) * 100)
      : 0;

    return NextResponse.json({
      frameworks: frameworkCoverages,
      overall,
    });
  } catch (error) {
    return handleApiError(error, 'calculating compliance coverage');
  }
}
