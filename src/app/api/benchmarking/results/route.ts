/**
 * GET /api/benchmarking/results
 * Returns percentile comparison for the organization
 * Query params: industry, orgSize, metricType
 * Requires: VIEWER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
} from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { hashOrganizationId } from '@/lib/benchmarking-differential-privacy';
import { validateSampleSize } from '@/lib/benchmarking-differential-privacy';

const MINIMUM_SAMPLE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const orgSize = searchParams.get('orgSize');
    const metricType = searchParams.get('metricType');

    // Validate required params
    if (!industry || !orgSize || !metricType) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: industry, orgSize, metricType',
        },
        { status: 400 }
      );
    }

    // Get organization's own value
    const organizationHash = hashOrganizationId(session.user.organizationId);
    const orgSnapshot = await prisma.benchmarkSnapshot.findFirst({
      where: {
        organizationHash,
        industry,
        orgSize,
        metricType,
      },
      orderBy: { snapshotDate: 'desc' },
    });

    // Get industry percentiles using raw SQL
    const percentiles = await prisma.$queryRaw<
      Array<{ p25: number; p50: number; p75: number; count: bigint }>
    >`
      SELECT
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value) as p25,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
        COUNT(*) as count
      FROM benchmark_snapshots
      WHERE industry = ${industry}
        AND org_size = ${orgSize}
        AND metric_type = ${metricType}
    `;

    if (percentiles.length === 0) {
      return NextResponse.json(
        {
          error: 'No benchmark data available for the specified criteria',
        },
        { status: 404 }
      );
    }

    const { p25, p50, p75, count } = percentiles[0];
    const sampleCount = Number(count);

    // Validate minimum sample size
    if (!validateSampleSize(sampleCount, MINIMUM_SAMPLE_SIZE)) {
      return NextResponse.json(
        {
          error: `Insufficient data: minimum ${MINIMUM_SAMPLE_SIZE} samples required (found ${sampleCount})`,
          sampleCount,
        },
        { status: 400 }
      );
    }

    // Calculate organization's percentile rank if they have data
    let orgPercentileRank: number | null = null;
    if (orgSnapshot) {
      const rankResult = await prisma.$queryRaw<Array<{ rank: number }>>`
        SELECT PERCENT_RANK() OVER (ORDER BY value) * 100 as rank
        FROM benchmark_snapshots
        WHERE industry = ${industry}
          AND org_size = ${orgSize}
          AND metric_type = ${metricType}
          AND organization_hash = ${organizationHash}
        ORDER BY snapshot_date DESC
        LIMIT 1
      `;
      orgPercentileRank = rankResult.length > 0 ? rankResult[0].rank : null;
    }

    return NextResponse.json({
      industry,
      orgSize,
      metricType,
      percentiles: {
        p25: Number(p25),
        p50: Number(p50),
        p75: Number(p75),
      },
      sampleCount,
      yourValue: orgSnapshot?.value ?? null,
      yourPercentileRank: orgPercentileRank,
    });
  } catch (error) {
    return handleApiError(error, 'fetching benchmark results');
  }
}
