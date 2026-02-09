/**
 * Virus Scanner Service - ClamAV integration
 * Provides malware scanning for uploaded files
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolve, normalize } from 'path';
import { logger } from './logger';

const execFileAsync = promisify(execFile);

interface ScanResult {
  clean: boolean;
  skipped: boolean;
  threat?: string;
}

const SCAN_TIMEOUT = 30000; // 30 seconds

/**
 * Scan a file for viruses using ClamAV
 * @param filePath - Absolute path to the file to scan
 * @returns Scan result indicating if file is clean, skipped, or contains threats
 */
export async function scanFile(filePath: string): Promise<ScanResult> {
  // Check if ClamAV scanning is enabled
  const enabled = process.env.CLAMAV_ENABLED === 'true';

  if (!enabled) {
    logger.debug('Virus scanning disabled', { context: 'VirusScanner' });
    return { clean: true, skipped: true };
  }

  // Validate file path is within /tmp/ to prevent path traversal
  const resolvedPath = resolve(normalize(filePath));
  if (!resolvedPath.startsWith('/tmp/')) {
    logger.error('Virus scan rejected: file path outside /tmp/', {
      context: 'VirusScanner',
      data: { filePath, resolvedPath },
    });
    throw new Error('File path must be in /tmp/ directory');
  }

  try {
    // Execute clamscan with --no-summary flag to reduce output
    const { stdout } = await execFileAsync(
      'clamscan',
      ['--no-summary', filePath],
      { timeout: SCAN_TIMEOUT }
    );

    // Exit code 0 = clean
    logger.info('File scan completed: clean', {
      context: 'VirusScanner',
      data: { filePath },
    });

    return { clean: true, skipped: false };
  } catch (error: any) {
    // Check if clamscan is not installed
    if (error.code === 'ENOENT') {
      logger.warn('ClamAV not found on system, skipping scan', {
        context: 'VirusScanner',
        data: { filePath },
      });
      return { clean: true, skipped: true };
    }

    // Exit code 1 = virus found
    if (error.code === 1) {
      const threatMatch = error.stdout?.match(/FOUND:\s*(.+)/);
      const threat = threatMatch ? threatMatch[1].trim() : 'Unknown threat';

      logger.warn('Virus detected in file', {
        context: 'VirusScanner',
        data: { filePath, threat },
      });

      return { clean: false, skipped: false, threat };
    }

    // Exit code 2 or other = scan error
    logger.error('Virus scan failed', error, {
      context: 'VirusScanner',
      data: { filePath, exitCode: error.code },
    });

    // On scan error, skip for safety (don't block upload, but log)
    return { clean: true, skipped: true };
  }
}

/**
 * Check if virus scanner is available and enabled
 * @returns True if ClamAV is enabled in environment
 */
export function isVirusScannerAvailable(): boolean {
  return process.env.CLAMAV_ENABLED === 'true';
}
