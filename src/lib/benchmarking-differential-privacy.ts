/**
 * Differential privacy utilities for benchmarking data anonymization
 * Implements Laplace mechanism for epsilon-differential privacy
 */

import crypto from 'crypto';

const BENCHMARK_SALT = process.env.BENCHMARK_SALT || 'benchmark-salt-2026';

/**
 * Generate Laplace-distributed random number
 * Uses inverse transform sampling: F^-1(u) = -sgn(u - 0.5) * ln(1 - 2|u - 0.5|)
 */
function laplaceRandom(): number {
  const u = Math.random(); // Uniform(0,1)
  const sign = u < 0.5 ? 1 : -1;
  return -sign * Math.log(1 - 2 * Math.abs(u - 0.5));
}

/**
 * Add Laplace noise to a value for differential privacy
 * @param value - Original value
 * @param sensitivity - Global sensitivity (max change from one record)
 * @param epsilon - Privacy parameter (smaller = more private, typical: 0.5-2.0)
 * @returns Noisy value
 */
export function addLaplaceNoise(
  value: number,
  sensitivity: number,
  epsilon: number
): number {
  const scale = sensitivity / epsilon;
  const noise = scale * laplaceRandom();
  return value + noise;
}

/**
 * Hash organization ID with salt for anonymization
 * @param orgId - Original organization ID
 * @returns SHA256 hash (64 hex chars)
 */
export function hashOrganizationId(orgId: string): string {
  return crypto
    .createHash('sha256')
    .update(orgId + BENCHMARK_SALT)
    .digest('hex');
}

/**
 * Validate minimum sample size for statistical significance
 * @param count - Number of samples
 * @param minimum - Minimum required samples
 * @returns True if sample size is sufficient
 */
export function validateSampleSize(count: number, minimum: number): boolean {
  return count >= minimum;
}
