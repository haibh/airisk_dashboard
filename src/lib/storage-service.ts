/**
 * S3-Compatible Storage Service
 * Handles file uploads, downloads, deletion, and metadata management
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { logger } from './logger';

// Environment variable validation
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10); // Default: 50MB

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'image/png',
  'image/jpeg',
  'video/mp4',
] as const;

// Check environment configuration
function checkConfig(): boolean {
  const missing: string[] = [];

  if (!S3_ENDPOINT) missing.push('S3_ENDPOINT');
  if (!S3_ACCESS_KEY) missing.push('S3_ACCESS_KEY');
  if (!S3_SECRET_KEY) missing.push('S3_SECRET_KEY');
  if (!S3_BUCKET) missing.push('S3_BUCKET');

  if (missing.length > 0) {
    const message = `Missing S3 configuration: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      logger.error(message, undefined, { context: 'StorageService' });
      throw new Error(message);
    } else {
      logger.warn(`${message}. S3 storage will not be available.`, { context: 'StorageService' });
      return false;
    }
  }

  return true;
}

// Initialize S3 client
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!checkConfig()) {
      throw new Error('S3 client not configured');
    }

    s3Client = new S3Client({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY!,
        secretAccessKey: S3_SECRET_KEY!,
      },
      forcePathStyle: true, // Required for MinIO and some S3-compatible services
    });

    logger.info('S3 client initialized', {
      context: 'StorageService',
      data: { endpoint: S3_ENDPOINT, region: S3_REGION, bucket: S3_BUCKET }
    });
  }

  return s3Client;
}

/**
 * Calculate SHA-256 hash of a buffer
 * @param buffer - File buffer to hash
 * @returns Hex string representation of hash
 */
export function calculateSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate file before upload
 * @param filename - Original filename
 * @param size - File size in bytes
 * @param mimeType - MIME type of the file
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  filename: string,
  size: number,
  mimeType: string
): { valid: boolean; error?: string } {
  // Check file size
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Check filename
  if (!filename || filename.length === 0) {
    return {
      valid: false,
      error: 'Filename is required',
    };
  }

  return { valid: true };
}

/**
 * Upload file to S3 bucket
 * @param buffer - File buffer to upload
 * @param key - Storage key/path (e.g., "evidence/abc123.pdf")
 * @param contentType - MIME type of the file
 * @returns Storage key/path of uploaded file
 * @throws Error if upload fails
 */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Optional: Add metadata
      Metadata: {
        uploadedAt: new Date().toISOString(),
        sha256: calculateSha256(buffer),
      },
    });

    await client.send(command);

    logger.info(`File uploaded successfully: ${key}`, {
      context: 'StorageService',
      data: { key, contentType, size: buffer.length },
    });

    return key;
  } catch (error) {
    const errorId = logger.error(`Failed to upload file: ${key}`, error, {
      context: 'StorageService',
      data: { key, contentType },
    });
    throw new Error(`File upload failed (${errorId})`);
  }
}

/**
 * Generate presigned URL for file download
 * @param key - Storage key/path
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL for downloading the file
 * @throws Error if URL generation fails
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
    });

    const url = await getS3SignedUrl(client, command, { expiresIn });

    logger.debug(`Generated signed URL for: ${key}`, {
      context: 'StorageService',
      data: { key, expiresIn },
    });

    return url;
  } catch (error) {
    const errorId = logger.error(`Failed to generate signed URL: ${key}`, error, {
      context: 'StorageService',
      data: { key },
    });
    throw new Error(`Signed URL generation failed (${errorId})`);
  }
}

/**
 * Delete file from S3 bucket
 * @param key - Storage key/path
 * @returns True if deletion successful, false otherwise
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
    });

    await client.send(command);

    logger.info(`File deleted successfully: ${key}`, {
      context: 'StorageService',
      data: { key },
    });

    return true;
  } catch (error) {
    logger.error(`Failed to delete file: ${key}`, error, {
      context: 'StorageService',
      data: { key },
    });
    return false;
  }
}

/**
 * Get file metadata from S3
 * @param key - Storage key/path
 * @returns File metadata (size, contentType, lastModified) or null if not found
 */
export async function getFileMetadata(
  key: string
): Promise<{ size: number; contentType: string; lastModified: Date } | null> {
  try {
    const client = getS3Client();

    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
    });

    const response = await client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
    };
  } catch (error: any) {
    // Return null if file not found (404)
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      logger.debug(`File not found: ${key}`, {
        context: 'StorageService',
        data: { key },
      });
      return null;
    }

    logger.error(`Failed to get file metadata: ${key}`, error, {
      context: 'StorageService',
      data: { key },
    });
    return null;
  }
}

/**
 * Check if S3 storage is configured and available
 * @returns True if S3 is configured
 */
export function isStorageConfigured(): boolean {
  return checkConfig();
}

// Export constants for external use
export { MAX_FILE_SIZE, ALLOWED_MIME_TYPES };
