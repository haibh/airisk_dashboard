/**
 * Cron Endpoint for Scheduled Jobs
 *
 * GET /api/cron/run-scheduled-jobs - Process all due scheduled jobs
 *
 * Security: Protected by Vercel Cron secret or Authorization Bearer token
 * Triggered: Every 15 minutes by Vercel Cron (configured in vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { processScheduledJobs } from '@/lib/scheduled-job-runner';

// Import handlers to ensure they're registered
import '@/lib/scheduled-job-handlers';

// ============================================================================
// SECURITY VALIDATION
// ============================================================================

/**
 * Validate cron request is from authorized source
 * Supports:
 * 1. Vercel Cron secret (x-vercel-cron-secret header)
 * 2. Bearer token (Authorization header)
 * 3. Custom secret (CRON_SECRET env var)
 */
function validateCronRequest(request: NextRequest): boolean {
  // Check Vercel Cron secret (automatically added by Vercel Cron)
  const vercelCronSecret = request.headers.get('x-vercel-cron-secret');
  if (vercelCronSecret && process.env.CRON_SECRET) {
    return vercelCronSecret === process.env.CRON_SECRET;
  }

  // Check Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader && process.env.CRON_SECRET) {
    const token = authHeader.replace('Bearer ', '');
    return token === process.env.CRON_SECRET;
  }

  // In development, allow without auth
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Cron endpoint accessed in development mode without auth');
    return true;
  }

  return false;
}

// ============================================================================
// GET /api/cron/run-scheduled-jobs
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate request authorization
    if (!validateCronRequest(request)) {
      logger.error('Unauthorized cron request attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Cron triggered: Processing scheduled jobs');

    // Process all due jobs
    await processScheduledJobs();

    const duration = Date.now() - startTime;

    logger.info(`Cron completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Scheduled jobs processed',
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Cron execution failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process scheduled jobs',
        duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
