/**
 * Manual Job Execution API Route
 *
 * POST /api/scheduled-jobs/[id]/run - Trigger immediate job execution
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
import {
  executeJob,
  acquireJobLock,
  releaseJobLock,
  calculateNextRunTime,
} from '@/lib/scheduled-job-runner';

// Import handlers to ensure they're registered
import '@/lib/scheduled-job-handlers';

// ============================================================================
// POST /api/scheduled-jobs/[id]/run
// ============================================================================

export async function POST(
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

    const { organizationId, role, id: userId } = session.user;

    // Check RISK_MANAGER+ role
    if (!hasMinimumRole(role, 'RISK_MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Fetch job
    const job = await prisma.scheduledJob.findUnique({
      where: {
        id,
        organizationId, // Ensure job belongs to user's org
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is already running
    if (job.status === JobStatus.RUNNING) {
      return NextResponse.json(
        { success: false, error: 'Job is already running' },
        { status: 409 }
      );
    }

    // Try to acquire lock
    const lockAcquired = await acquireJobLock(id);

    if (!lockAcquired) {
      return NextResponse.json(
        { success: false, error: 'Job execution is locked by another process' },
        { status: 409 }
      );
    }

    try {
      // Mark job as running
      await prisma.scheduledJob.update({
        where: { id },
        data: { status: JobStatus.RUNNING },
      });

      logger.info(`Manual job execution triggered: ${id} by user ${userId}`);

      // Execute job
      const result = await executeJob(job);

      // Calculate next scheduled run
      const nextRunAt = calculateNextRunTime(job.schedule);

      // Update job with result
      const updatedJob = await prisma.scheduledJob.update({
        where: { id },
        data: {
          status: result.success ? JobStatus.ACTIVE : JobStatus.FAILED,
          lastRunAt: new Date(),
          nextRunAt,
          lastResult: result as object,
          errorCount: result.success ? 0 : { increment: 1 },
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

      logger.info(
        `Job execution completed: ${id} (${result.success ? 'SUCCESS' : 'FAILED'})`
      );

      return NextResponse.json({
        success: true,
        data: {
          job: updatedJob,
          result,
        },
      });
    } finally {
      // Always release lock
      await releaseJobLock(id);
    }
  } catch (error) {
    logger.error(`Error executing job:`, error);

    // Try to reset job status on error
    try {
      await prisma.scheduledJob.update({
        where: { id },
        data: {
          status: JobStatus.FAILED,
          errorCount: { increment: 1 },
        },
      });
      await releaseJobLock(id);
    } catch (resetError) {
      logger.error(`Failed to reset job status after error:`, resetError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute job',
      },
      { status: 500 }
    );
  }
}
