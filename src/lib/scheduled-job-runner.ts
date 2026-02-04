/**
 * Scheduled Job Runner
 *
 * Core job execution engine with Redis-based distributed locking,
 * retry logic, and pluggable job handlers for automated report generation.
 */

import { JobType, JobStatus, type ScheduledJob } from '@prisma/client';
import { prisma } from './db';
import { logger } from './logger';
import * as redis from './redis-client';
import CronExpressionParser from 'cron-parser';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface JobConfig {
  frameworkIds?: string[];
  startDate?: string;
  endDate?: string;
  riskCategories?: string[];
  severityLevels?: string[];
  includeEvidence?: boolean;
  format?: 'json' | 'csv';
  recipients?: string[];
  [key: string]: unknown;
}

export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  executedAt: string;
}

export interface JobHandler {
  type: JobType;
  execute: (config: JobConfig, orgId: string) => Promise<JobResult>;
}

// ============================================================================
// JOB HANDLER REGISTRY
// ============================================================================

const jobHandlers = new Map<JobType, JobHandler>();

/**
 * Register a job handler for a specific job type
 */
export function registerJobHandler(handler: JobHandler): void {
  jobHandlers.set(handler.type, handler);
  logger.info(`Registered job handler: ${handler.type}`);
}

/**
 * Get registered job handler by type
 */
function getJobHandler(type: JobType): JobHandler | undefined {
  return jobHandlers.get(type);
}

// ============================================================================
// DISTRIBUTED LOCKING (Redis)
// ============================================================================

const LOCK_TTL = 300; // 5 minutes lock timeout
const LOCK_PREFIX = 'job:lock:';

/**
 * Acquire distributed lock for job execution
 * Prevents duplicate execution in multi-instance deployments
 */
export async function acquireJobLock(jobId: string): Promise<boolean> {
  const lockKey = `${LOCK_PREFIX}${jobId}`;

  if (!redis.isConnected()) {
    logger.warn(`Redis unavailable for lock acquisition: ${jobId}`);
    // In single-instance mode without Redis, always acquire lock
    return true;
  }

  try {
    const lockAcquired = await redis.exists(lockKey);
    if (lockAcquired) {
      logger.debug(`Job lock already held: ${jobId}`);
      return false;
    }

    // Set lock with TTL
    await redis.set(lockKey, { acquiredAt: new Date().toISOString() }, LOCK_TTL);
    logger.debug(`Job lock acquired: ${jobId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to acquire job lock ${jobId}:`, error);
    return false;
  }
}

/**
 * Release distributed lock after job completion
 */
export async function releaseJobLock(jobId: string): Promise<void> {
  const lockKey = `${LOCK_PREFIX}${jobId}`;

  if (!redis.isConnected()) {
    return;
  }

  try {
    await redis.del(lockKey);
    logger.debug(`Job lock released: ${jobId}`);
  } catch (error) {
    logger.error(`Failed to release job lock ${jobId}:`, error);
  }
}

// ============================================================================
// CRON PARSING
// ============================================================================

/**
 * Calculate next run time from cron expression
 * @param schedule - Cron expression (e.g., "0 9 * * 1" for "Every Monday at 9am")
 * @returns Next scheduled execution time
 */
export function calculateNextRunTime(schedule: string): Date {
  try {
    const interval = CronExpressionParser.parse(schedule);
    return interval.next().toDate();
  } catch (error) {
    logger.error(`Invalid cron expression: ${schedule}`, error);
    // Default to 1 day from now if parsing fails
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
}

// ============================================================================
// JOB EXECUTION
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000; // 1 second
const JOB_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Execute a single scheduled job with timeout and retry logic
 */
export async function executeJob(job: ScheduledJob): Promise<JobResult> {
  const startTime = Date.now();
  const handler = getJobHandler(job.jobType);

  if (!handler) {
    return {
      success: false,
      error: `No handler registered for job type: ${job.jobType}`,
      duration: Date.now() - startTime,
      executedAt: new Date().toISOString(),
    };
  }

  try {
    // Execute with timeout
    const resultPromise = handler.execute(
      job.config as JobConfig,
      job.organizationId
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Job execution timeout')), JOB_TIMEOUT)
    );

    const data = await Promise.race([resultPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    logger.info(`Job executed successfully: ${job.id} (${job.jobType}) in ${duration}ms`);

    return {
      success: true,
      data,
      duration,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`Job execution failed: ${job.id} (${job.jobType})`, error);

    return {
      success: false,
      error: errorMessage,
      duration,
      executedAt: new Date().toISOString(),
    };
  }
}

/**
 * Execute job with exponential backoff retry logic
 */
async function executeJobWithRetry(job: ScheduledJob): Promise<JobResult> {
  let lastResult: JobResult | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    logger.info(`Executing job ${job.id} (attempt ${attempt}/${MAX_RETRIES})`);

    lastResult = await executeJob(job);

    if (lastResult.success) {
      return lastResult;
    }

    // If not the last attempt, wait with exponential backoff
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
      logger.warn(`Job failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return lastResult!;
}

/**
 * Update job status and result in database
 */
async function updateJobAfterExecution(
  jobId: string,
  result: JobResult,
  nextRunAt: Date
): Promise<void> {
  try {
    await prisma.scheduledJob.update({
      where: { id: jobId },
      data: {
        status: result.success ? JobStatus.ACTIVE : JobStatus.FAILED,
        lastRunAt: new Date(),
        nextRunAt,
        lastResult: result as object,
        errorCount: result.success ? 0 : { increment: 1 },
      },
    });
  } catch (error) {
    logger.error(`Failed to update job ${jobId} after execution:`, error);
  }
}

// ============================================================================
// MAIN CRON PROCESSOR
// ============================================================================

/**
 * Process all due scheduled jobs
 * Called by cron endpoint (typically every 15 minutes)
 */
export async function processScheduledJobs(): Promise<void> {
  logger.info('Starting scheduled job processing...');

  const now = new Date();

  try {
    // Find all active jobs that are due for execution
    const dueJobs = await prisma.scheduledJob.findMany({
      where: {
        status: JobStatus.ACTIVE,
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null },
        ],
      },
      orderBy: { nextRunAt: 'asc' },
    });

    logger.info(`Found ${dueJobs.length} due jobs to process`);

    // Process jobs sequentially to avoid overwhelming the system
    for (const job of dueJobs) {
      await processJob(job);
    }

    logger.info('Scheduled job processing completed');
  } catch (error) {
    logger.error('Error processing scheduled jobs:', error);
  }
}

/**
 * Process a single job with locking
 */
async function processJob(job: ScheduledJob): Promise<void> {
  const lockAcquired = await acquireJobLock(job.id);

  if (!lockAcquired) {
    logger.info(`Job ${job.id} already running, skipping`);
    return;
  }

  try {
    // Mark job as running
    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: { status: JobStatus.RUNNING },
    });

    // Execute job with retry
    const result = await executeJobWithRetry(job);

    // Calculate next run time
    const nextRunAt = calculateNextRunTime(job.schedule);

    // Update job with result
    await updateJobAfterExecution(job.id, result, nextRunAt);

    logger.info(`Job ${job.id} completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    logger.error(`Error processing job ${job.id}:`, error);

    // Reset job status to FAILED on exception
    await prisma.scheduledJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.FAILED,
        errorCount: { increment: 1 },
      },
    });
  } finally {
    // Always release lock
    await releaseJobLock(job.id);
  }
}
