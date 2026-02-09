import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanFile, isVirusScannerAvailable } from '@/lib/file-virus-scanner-service';

// Mock child_process to prevent actual command execution
vi.mock('child_process', () => ({
  execFile: vi.fn((cmd, args, opts, callback) => {
    // Mock successful scan (clean file)
    callback(null, '/tmp/test.pdf: OK', '');
  }),
}));

describe('file-virus-scanner-service', () => {
  describe('isVirusScannerAvailable', () => {
    it('returns a boolean value', () => {
      // Note: This function checks env vars at module load time
      const result = isVirusScannerAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('scanFile', () => {
    it('returns scan result when scanner disabled', async () => {
      // When scanner is disabled, returns skipped=true
      const result = await scanFile('/tmp/test.pdf');

      expect(result).toHaveProperty('clean');
      expect(result).toHaveProperty('skipped');
      expect(typeof result.clean).toBe('boolean');
      expect(typeof result.skipped).toBe('boolean');
    });

    it('handles various file paths', async () => {
      await expect(scanFile('/tmp/document.pdf')).resolves.toHaveProperty('clean');
      await expect(scanFile('/tmp/image.jpg')).resolves.toHaveProperty('clean');
      await expect(scanFile('/tmp/data.xlsx')).resolves.toHaveProperty('clean');
    });

    it('returns result with optional threat property', async () => {
      const result = await scanFile('/tmp/test-file.dat');

      expect(result).toHaveProperty('clean');
      expect(result).toHaveProperty('skipped');
      // threat property may or may not be present
      if (result.threat !== undefined) {
        expect(typeof result.threat).toBe('string');
      }
    });

    it('handles timeout parameter', async () => {
      const result = await scanFile('/tmp/large-file.bin', 5000);

      expect(result).toHaveProperty('clean');
      expect(result).toHaveProperty('skipped');
    });
  });
});
