/**
 * POST /api/benchmarking/submit
 * Submit anonymous snapshot of org metrics for peer benchmarking
 * Requires: RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-helpers';
import { hasMinimumRole } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
} from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { hashOrganizationId } from '@/lib/benchmarking-differential-privacy';

// Validation schema
const submitBenchmarkSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  orgSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']),
  metrics: z
    .array(
      z.object({
        type: z.string().min(1, 'Metric type is required'),
        value: z.number().min(0, 'Metric value must be non-negative'),
      })
    )
    .min(1, 'At least one metric is required'),
});

type SubmitBenchmarkInput = z.infer<typeof submitBenchmarkSchema>;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Require RISK_MANAGER+ role
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const parseResult = submitBenchmarkSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { industry, orgSize, metrics } = parseResult.data;

    // Hash organization ID for anonymization
    const organizationHash = hashOrganizationId(session.user.organizationId);

    // Create benchmark snapshots
    const snapshots = await prisma.$transaction(
      metrics.map((metric) =>
        prisma.benchmarkSnapshot.create({
          data: {
            organizationHash,
            industry,
            orgSize,
            metricType: metric.type,
            value: metric.value,
            snapshotDate: new Date(),
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: 'Benchmark data submitted successfully',
        snapshotsCreated: snapshots.length,
        industry,
        orgSize,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'submitting benchmark data');
  }
}
