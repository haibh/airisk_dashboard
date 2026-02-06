/**
 * Anomaly Detector Utility
 * Statistical anomaly detection using Z-score analysis
 */

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AnomalyResult {
  isAnomaly: boolean;
  zScore: number;
  severity: AnomalySeverity;
  expectedValue: number;
  deviation: number;
}

/**
 * Calculate mean of values array
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Detect anomaly using Z-score analysis
 * Thresholds:
 *  - |z| > 3.0 = CRITICAL
 *  - |z| > 2.5 = HIGH
 *  - |z| > 2.0 = MEDIUM
 *  - |z| <= 2.0 = LOW (not an anomaly)
 */
export function detectAnomaly(values: number[], currentValue: number): AnomalyResult {
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);

  // Handle edge case: no deviation (all values the same)
  if (stdDev === 0) {
    return {
      isAnomaly: currentValue !== mean,
      zScore: currentValue !== mean ? Infinity : 0,
      severity: currentValue !== mean ? 'CRITICAL' : 'LOW',
      expectedValue: mean,
      deviation: 0,
    };
  }

  const zScore = (currentValue - mean) / stdDev;
  const absZScore = Math.abs(zScore);

  let severity: AnomalySeverity;
  let isAnomaly = false;

  if (absZScore > 3.0) {
    severity = 'CRITICAL';
    isAnomaly = true;
  } else if (absZScore > 2.5) {
    severity = 'HIGH';
    isAnomaly = true;
  } else if (absZScore > 2.0) {
    severity = 'MEDIUM';
    isAnomaly = true;
  } else {
    severity = 'LOW';
    isAnomaly = false;
  }

  return {
    isAnomaly,
    zScore,
    severity,
    expectedValue: mean,
    deviation: stdDev,
  };
}
