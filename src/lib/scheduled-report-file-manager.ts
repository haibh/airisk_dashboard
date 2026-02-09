import { uploadFile, getSignedUrl, deleteFile } from './storage-service';
import { logger } from './logger';

/**
 * Save report file to S3 storage
 * @param orgId - Organization ID
 * @param jobType - Job type (used in filename)
 * @param buffer - Report file buffer
 * @param format - File format (xlsx, csv, pdf, json)
 * @returns S3 object key
 */
export async function saveReport(
  orgId: string,
  jobType: string,
  buffer: Buffer,
  format: string
): Promise<string> {
  // Generate unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `reports/${orgId}/${jobType}_${timestamp}.${format}`;

  try {
    await uploadFile(buffer, key, getMimeType(format));
    logger.info(`Report saved to S3: ${key}`);
    return key;
  } catch (error) {
    logger.error(`Failed to save report to S3: ${key}`, error);
    throw error;
  }
}

/**
 * Get presigned download URL for report file
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned download URL
 */
export async function getReportDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const url = await getSignedUrl(key, expiresIn);
    logger.info(`Generated download URL for report: ${key}`);
    return url;
  } catch (error) {
    logger.error(`Failed to generate download URL for: ${key}`, error);
    throw error;
  }
}

/**
 * Clean up old report files from S3
 * @param orgId - Organization ID
 * @param maxAgeDays - Maximum age of reports to keep (default: 30 days)
 * @returns Number of reports deleted
 */
export async function cleanupOldReports(
  orgId: string,
  maxAgeDays: number = 30
): Promise<number> {
  // Note: Full implementation would require ListObjectsV2Command from @aws-sdk/client-s3
  // For now, log the cleanup request and return 0
  // This can be enhanced when S3 listing functionality is needed

  logger.info(
    `Report cleanup requested for org ${orgId}: max age ${maxAgeDays} days`
  );

  // TODO: Implement S3 ListObjectsV2 to find and delete old reports
  // Example logic:
  // 1. List all objects with prefix `reports/${orgId}/`
  // 2. Filter by LastModified date older than maxAgeDays
  // 3. Delete matching objects
  // 4. Return count of deleted objects

  return 0;
}

/**
 * Get MIME type for file format
 * @param format - File format
 * @returns MIME type string
 */
function getMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}
