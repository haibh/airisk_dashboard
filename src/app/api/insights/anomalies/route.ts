/**
 * GET /api/insights/anomalies
 * Returns recent anomaly events for the organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      days: searchParams.get('days') || undefined,
      severity: searchParams.get('severity') || undefined,
    });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - query.days);

    const where: any = {
      organizationId: session.user.organizationId,
      detectedAt: {
        gte: cutoffDate,
      },
    };

    if (query.severity) {
      where.severity = query.severity;
    }

    const anomalies = await prisma.anomalyEvent.findMany({
      where,
      orderBy: [
        { severity: 'asc' }, // CRITICAL first
        { detectedAt: 'desc' },
      ],
      take: 100,
    });

    return NextResponse.json({
      anomalies,
      total: anomalies.length,
      daysRange: query.days,
    });
  } catch (error) {
    return handleApiError(error, 'fetching anomaly events');
  }
}
