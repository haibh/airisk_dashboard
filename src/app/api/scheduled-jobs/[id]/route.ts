/**
 * Scheduled Job Detail API Route
 *
 * GET    /api/scheduled-jobs/[id] - Get job details with history
 * PUT    /api/scheduled-jobs/[id] - Update job configuration
 * DELETE /api/scheduled-jobs/[id] - Delete job
 *
 * Requires: RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { JobStatus } from '@prisma/client';
import { calculateNextRunTime } from '@/lib/scheduled-job-runner';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateJobSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  schedule: z.string().min(1).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  status: z.nativeEnum(JobStatus).optional(),
});

// ============================================================================
// GET /api/scheduled-jobs/[id]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId } = session.user;

    // Fetch job with related data
    const job = await prisma.scheduledJob.findUnique({
      where: {
        id,
        organizationId, // Ensure job belongs to user's org
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

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    logger.error(`Error fetching job ${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/scheduled-jobs/[id]
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId, role } = session.user;

    // Check RISK_MANAGER+ role
    if (!hasMinimumRole(role, 'RISK_MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify job exists and belongs to org
    const existingJob = await prisma.scheduledJob.findUnique({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Prevent updates while job is running
    if (existingJob.status === JobStatus.RUNNING) {
      return NextResponse.json(
        { success: false, error: 'Cannot update job while running' },
        { status: 409 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateJobSchema.safeParse(body);

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

    const updates = validation.data;

    // If schedule is updated, validate and recalculate next run time
    let nextRunAt = existingJob.nextRunAt;
    if (updates.schedule) {
      try {
        nextRunAt = calculateNextRunTime(updates.schedule);
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
    }

    // Update job
    const updatedJob = await prisma.scheduledJob.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.config ? { config: updates.config as object } : {}),
        ...(updates.schedule ? { nextRunAt } : {}),
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

    logger.info(`Scheduled job updated: ${id}`);

    return NextResponse.json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    logger.error(`Error updating job:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update job',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/scheduled-jobs/[id]
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId, role } = session.user;

    // Check RISK_MANAGER+ role
    if (!hasMinimumRole(role, 'RISK_MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify job exists and belongs to org
    const existingJob = await prisma.scheduledJob.findUnique({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Prevent deletion while job is running
    if (existingJob.status === JobStatus.RUNNING) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete job while running' },
        { status: 409 }
      );
    }

    // Delete job
    await prisma.scheduledJob.delete({
      where: { id },
    });

    logger.info(`Scheduled job deleted: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting job:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete job',
      },
      { status: 500 }
    );
  }
}
