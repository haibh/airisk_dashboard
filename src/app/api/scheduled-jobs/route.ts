/**
 * Scheduled Jobs API Route
 *
 * GET  /api/scheduled-jobs - List organization's scheduled jobs
 * POST /api/scheduled-jobs - Create new scheduled job
 *
 * Requires: RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { JobType, JobStatus } from '@prisma/client';
import { calculateNextRunTime } from '@/lib/scheduled-job-runner';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createJobSchema = z.object({
  name: z.string().min(1).max(200),
  jobType: z.nativeEnum(JobType),
  schedule: z.string().min(1), // Cron expression
  config: z.record(z.string(), z.unknown()).optional().default({}),
});

// ============================================================================
// GET /api/scheduled-jobs
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId } = session.user;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const jobType = searchParams.get('jobType') as JobType | null;

    // Build filter
    const filter: {
      organizationId: string;
      status?: JobStatus;
      jobType?: JobType;
    } = {
      organizationId,
    };

    if (status) {
      filter.status = status;
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    // Fetch jobs
    const jobs = await prisma.scheduledJob.findMany({
      where: filter,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: jobs,
      total: jobs.length,
    });
  } catch (error) {
    logger.error('Error fetching scheduled jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scheduled jobs',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/scheduled-jobs
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId, role, id: userId } = session.user;

    // Check RISK_MANAGER+ role
    if (!hasMinimumRole(role, 'RISK_MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createJobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, jobType, schedule, config } = validation.data;

    // Validate cron expression by attempting to parse
    try {
      calculateNextRunTime(schedule);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cron expression',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    // Calculate initial next run time
    const nextRunAt = calculateNextRunTime(schedule);

    // Create job
    const job = await prisma.scheduledJob.create({
      data: {
        name,
        jobType,
        schedule,
        config: config as object,
        nextRunAt,
        status: JobStatus.ACTIVE,
        organizationId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Scheduled job created: ${job.id} (${jobType}) by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: job,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating scheduled job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create scheduled job',
      },
      { status: 500 }
    );
  }
}
