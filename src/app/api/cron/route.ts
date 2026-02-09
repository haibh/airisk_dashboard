import { NextRequest, NextResponse } from 'next/server';
import { processScheduledJobs } from '@/lib/scheduled-job-runner';
import { logger } from '@/lib/logger';

/**
 * Cron trigger endpoint for scheduled jobs
 * Protected by CRON_SECRET - called by external scheduler (e.g., Vercel Cron, GitHub Actions)
 *
 * Usage:
 * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron
 */
export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error('CRON_SECRET not configured in environment');
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request attempt', {
        data: {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process all scheduled jobs
    logger.info('Cron trigger received, processing scheduled jobs');
    await processScheduledJobs();

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron execution failed', error);
    return NextResponse.json(
      {
        error: 'Cron execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
