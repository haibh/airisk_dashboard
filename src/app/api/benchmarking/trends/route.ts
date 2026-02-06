/**
 * GET /api/benchmarking/trends
 * Returns time-series comparison: org vs industry median over last 12 months
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

    const organizationHash = hashOrganizationId(session.user.organizationId);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Get industry medians by month
    const industryTrends = await prisma.$queryRaw<
      Array<{ month: Date; median: number }>
    >`
      SELECT
        DATE_TRUNC('month', snapshot_date) as month,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median
      FROM benchmark_snapshots
      WHERE industry = ${industry}
        AND org_size = ${orgSize}
        AND metric_type = ${metricType}
        AND snapshot_date >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', snapshot_date)
      ORDER BY month ASC
    `;

    // Get organization's values by month
    const orgTrends = await prisma.$queryRaw<
      Array<{ month: Date; value: number }>
    >`
      SELECT
        DATE_TRUNC('month', snapshot_date) as month,
        AVG(value) as value
      FROM benchmark_snapshots
      WHERE organization_hash = ${organizationHash}
        AND industry = ${industry}
        AND org_size = ${orgSize}
        AND metric_type = ${metricType}
        AND snapshot_date >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', snapshot_date)
      ORDER BY month ASC
    `;

    // Merge trends into single timeline
    const monthMap = new Map<string, { date: string; orgValue: number | null; industryMedian: number | null }>();

    industryTrends.forEach((row) => {
      const monthKey = row.month.toISOString().substring(0, 7); // YYYY-MM
      monthMap.set(monthKey, {
        date: monthKey,
        orgValue: null,
        industryMedian: Number(row.median),
      });
    });

    orgTrends.forEach((row) => {
      const monthKey = row.month.toISOString().substring(0, 7);
      const existing = monthMap.get(monthKey);
      if (existing) {
        existing.orgValue = Number(row.value);
      } else {
        monthMap.set(monthKey, {
          date: monthKey,
          orgValue: Number(row.value),
          industryMedian: null,
        });
      }
    });

    const months = Array.from(monthMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      industry,
      orgSize,
      metricType,
      months,
      dataPoints: months.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching benchmark trends');
  }
}
