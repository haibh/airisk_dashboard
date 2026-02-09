/**
 * Tests for S3-Compatible Storage Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Unmock storage-service to test actual implementation
vi.unmock('@/lib/storage-service');
import { calculateSha256, validateFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/storage-service';

describe('Storage Service - Utility Functions', () => {
  describe('calculateSha256', () => {
    it('should calculate SHA-256 hash correctly', () => {
      const buffer = Buffer.from('test data');
      const hash = calculateSha256(buffer);

      expect(hash).toBe('916f0027a575074ce72a331777c3478d6513f786a591bd892da1a577bf2335f9');
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different content', () => {
      const buffer1 = Buffer.from('content 1');
      const buffer2 = Buffer.from('content 2');

      const hash1 = calculateSha256(buffer1);
      const hash2 = calculateSha256(buffer2);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash for same content', () => {
      const content = 'same content';
      const hash1 = calculateSha256(Buffer.from(content));
      const hash2 = calculateSha256(Buffer.from(content));

      expect(hash1).toBe(hash2);
    });
  });

  describe('validateFile', () => {
    it('should validate PDF files correctly', () => {
      const result = validateFile('document.pdf', 1024 * 1024, 'application/pdf');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate DOCX files correctly', () => {
      const result = validateFile(
        'report.docx',
        2 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate XLSX files correctly', () => {
      const result = validateFile(
        'data.xlsx',
        3 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate image files correctly', () => {
      const pngResult = validateFile('image.png', 1024 * 1024, 'image/png');
      const jpegResult = validateFile('photo.jpg', 1024 * 1024, 'image/jpeg');

      expect(pngResult.valid).toBe(true);
      expect(jpegResult.valid).toBe(true);
    });

    it('should validate video files correctly', () => {
      const result = validateFile('video.mp4', 10 * 1024 * 1024, 'video/mp4');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files exceeding maximum size', () => {
      const oversizedFile = MAX_FILE_SIZE + 1;
      const result = validateFile('large.pdf', oversizedFile, 'application/pdf');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject empty files', () => {
      const result = validateFile('empty.pdf', 0, 'application/pdf');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should reject disallowed MIME types', () => {
      const result = validateFile('script.exe', 1024, 'application/x-msdownload');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files with missing filename', () => {
      const result1 = validateFile('', 1024, 'application/pdf');
      const result2 = validateFile(null as any, 1024, 'application/pdf');

      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('Filename is required');
      expect(result2.valid).toBe(false);
    });

    it('should allow files at exact maximum size', () => {
      const result = validateFile('max-size.pdf', MAX_FILE_SIZE, 'application/pdf');

      expect(result.valid).toBe(true);
    });
  });

  describe('ALLOWED_MIME_TYPES constant', () => {
    it('should contain all required MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_MIME_TYPES).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(ALLOWED_MIME_TYPES).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('video/mp4');
    });

    it('should have exactly 6 allowed types', () => {
      expect(ALLOWED_MIME_TYPES).toHaveLength(6);
    });
  });

  describe('MAX_FILE_SIZE constant', () => {
    it('should be set to 50MB by default', () => {
      expect(MAX_FILE_SIZE).toBe(52428800); // 50 * 1024 * 1024
    });
  });
});

/**
 * Note: Integration tests for S3 operations (uploadFile, getSignedUrl, deleteFile, getFileMetadata)
 * require actual S3/MinIO instance and are better suited for E2E tests.
 * These tests focus on utility functions that don't require external dependencies.
 */
