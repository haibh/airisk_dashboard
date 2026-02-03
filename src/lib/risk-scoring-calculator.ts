import { RiskLevel } from '@/types/risk-assessment';

/**
 * Calculate inherent risk score
 * @param likelihood - Likelihood rating (1-5)
 * @param impact - Impact rating (1-5)
 * @returns Inherent score (1-25)
 */
export function calculateInherentScore(
  likelihood: number,
  impact: number
): number {
  if (likelihood < 1 || likelihood > 5 || impact < 1 || impact > 5) {
    throw new Error('Likelihood and impact must be between 1 and 5');
  }
  return likelihood * impact;
}

/**
 * Calculate residual risk score after controls
 * @param inherentScore - Inherent risk score (1-25)
 * @param controlEffectiveness - Control effectiveness percentage (0-100)
 * @returns Residual score
 */
export function calculateResidualScore(
  inherentScore: number,
  controlEffectiveness: number
): number {
  if (controlEffectiveness < 0 || controlEffectiveness > 100) {
    throw new Error('Control effectiveness must be between 0 and 100');
  }
  return inherentScore * (1 - controlEffectiveness / 100);
}

/**
 * Calculate overall control effectiveness from multiple controls
 * @param controlEffectiveness - Array of individual control effectiveness values (0-100)
 * @returns Overall effectiveness (0-100)
 */
export function calculateOverallEffectiveness(
  controlEffectiveness: number[]
): number {
  if (controlEffectiveness.length === 0) {
    return 0;
  }

  // Use compound probability: 1 - (1-e1) * (1-e2) * ... * (1-en)
  const residualRisk = controlEffectiveness.reduce((acc, eff) => {
    return acc * (1 - eff / 100);
  }, 1);

  return (1 - residualRisk) * 100;
}

/**
 * Get risk level classification based on score
 * @param score - Risk score (1-25)
 * @returns Risk level
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 17) return 'CRITICAL';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get color for risk level
 * @param level - Risk level
 * @returns CSS color class
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[level];
}

/**
 * Get matrix cell color based on risk score
 * @param score - Risk score (1-25)
 * @returns CSS background color class
 */
export function getMatrixCellColor(score: number): string {
  const level = getRiskLevel(score);
  const colors: Record<RiskLevel, string> = {
    LOW: 'bg-green-200 hover:bg-green-300',
    MEDIUM: 'bg-yellow-200 hover:bg-yellow-300',
    HIGH: 'bg-orange-200 hover:bg-orange-300',
    CRITICAL: 'bg-red-200 hover:bg-red-300',
  };
  return colors[level];
}

/**
 * Validate risk parameters
 * @param likelihood - Likelihood rating (1-5)
 * @param impact - Impact rating (1-5)
 * @returns True if valid, throws error otherwise
 */
export function validateRiskParameters(
  likelihood: number,
  impact: number
): boolean {
  if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
    throw new Error('Likelihood must be an integer between 1 and 5');
  }
  if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
    throw new Error('Impact must be an integer between 1 and 5');
  }
  return true;
}
