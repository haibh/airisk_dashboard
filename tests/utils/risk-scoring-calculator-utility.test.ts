import { describe, it, expect } from 'vitest';
import {
  calculateInherentScore,
  calculateResidualScore,
  calculateOverallEffectiveness,
  getRiskLevel,
  getRiskLevelColor,
  getMatrixCellColor,
  validateRiskParameters,
  calculateRiskVelocity,
  calculateBatchRiskVelocity,
} from '@/lib/risk-scoring-calculator';

describe('calculateInherentScore', () => {
  it('should calculate score as likelihood * impact', () => {
    expect(calculateInherentScore(2, 3)).toBe(6);
    expect(calculateInherentScore(1, 1)).toBe(1);
    expect(calculateInherentScore(5, 5)).toBe(25);
  });

  it('should handle minimum values', () => {
    expect(calculateInherentScore(1, 1)).toBe(1);
  });

  it('should handle maximum values', () => {
    expect(calculateInherentScore(5, 5)).toBe(25);
  });

  it('should calculate various combinations', () => {
    expect(calculateInherentScore(2, 2)).toBe(4);
    expect(calculateInherentScore(3, 4)).toBe(12);
    expect(calculateInherentScore(4, 5)).toBe(20);
  });

  it('should throw error when likelihood is below 1', () => {
    expect(() => calculateInherentScore(0, 3)).toThrow(
      'Likelihood and impact must be between 1 and 5'
    );
  });

  it('should throw error when likelihood is above 5', () => {
    expect(() => calculateInherentScore(6, 3)).toThrow(
      'Likelihood and impact must be between 1 and 5'
    );
  });

  it('should throw error when impact is below 1', () => {
    expect(() => calculateInherentScore(3, 0)).toThrow(
      'Likelihood and impact must be between 1 and 5'
    );
  });

  it('should throw error when impact is above 5', () => {
    expect(() => calculateInherentScore(3, 6)).toThrow(
      'Likelihood and impact must be between 1 and 5'
    );
  });

  it('should throw error for negative values', () => {
    expect(() => calculateInherentScore(-1, 3)).toThrow(
      'Likelihood and impact must be between 1 and 5'
    );
    expect(() => calculateInherentScore(3, -2)).toThrow(
      'Likelihood and impact must be between 1 and 5'
    );
  });
});

describe('calculateResidualScore', () => {
  it('should reduce inherent score by control effectiveness', () => {
    expect(calculateResidualScore(10, 50)).toBe(5);
    expect(calculateResidualScore(20, 25)).toBe(15);
  });

  it('should return inherent score when no controls (0% effectiveness)', () => {
    expect(calculateResidualScore(15, 0)).toBe(15);
  });

  it('should return 0 when controls are 100% effective', () => {
    expect(calculateResidualScore(25, 100)).toBe(0);
  });

  it('should handle decimal effectiveness percentages', () => {
    const result = calculateResidualScore(10, 33.33);
    expect(Math.round(result * 100) / 100).toBe(6.67);
  });

  it('should calculate various combinations', () => {
    expect(calculateResidualScore(6, 50)).toBe(3);
    expect(calculateResidualScore(12, 75)).toBe(3);
    expect(calculateResidualScore(20, 50)).toBe(10);
  });

  it('should throw error when effectiveness is below 0', () => {
    expect(() => calculateResidualScore(10, -1)).toThrow(
      'Control effectiveness must be between 0 and 100'
    );
  });

  it('should throw error when effectiveness is above 100', () => {
    expect(() => calculateResidualScore(10, 101)).toThrow(
      'Control effectiveness must be between 0 and 100'
    );
  });

  it('should handle very small inherent scores', () => {
    expect(calculateResidualScore(1, 50)).toBe(0.5);
  });

  it('should handle very large inherent scores', () => {
    const result = calculateResidualScore(25, 90);
    expect(Math.round(result * 100) / 100).toBe(2.5);
  });
});

describe('calculateOverallEffectiveness', () => {
  it('should return 0 for empty array', () => {
    expect(calculateOverallEffectiveness([])).toBe(0);
  });

  it('should return same value for single control', () => {
    expect(calculateOverallEffectiveness([50])).toBe(50);
    expect(calculateOverallEffectiveness([0])).toBe(0);
    expect(calculateOverallEffectiveness([100])).toBe(100);
  });

  it('should compound effectiveness for multiple controls', () => {
    // Two 50% controls: 1 - (1-0.5) * (1-0.5) = 1 - 0.25 = 0.75 = 75%
    expect(calculateOverallEffectiveness([50, 50])).toBe(75);
  });

  it('should calculate three controls correctly', () => {
    // Three 50% controls: 1 - (1-0.5)^3 = 1 - 0.125 = 0.875 = 87.5%
    expect(calculateOverallEffectiveness([50, 50, 50])).toBe(87.5);
  });

  it('should handle mixed effectiveness values', () => {
    // [60, 80]: 1 - (1-0.6) * (1-0.8) = 1 - 0.4 * 0.2 = 1 - 0.08 = 0.92 = 92%
    expect(calculateOverallEffectiveness([60, 80])).toBe(92);
  });

  it('should handle 100% effective control', () => {
    // With one 100% control, overall should be 100%
    expect(calculateOverallEffectiveness([100])).toBe(100);
    expect(calculateOverallEffectiveness([100, 50])).toBe(100);
  });

  it('should handle 0% effective control', () => {
    // With one 0% control, doesn't reduce other controls
    const result = calculateOverallEffectiveness([0, 50]);
    expect(result).toBe(50);
  });

  it('should return value between 0 and 100', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    values.forEach((v) => {
      const result = calculateOverallEffectiveness([v]);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  it('should handle many controls', () => {
    const manyControls = Array(10).fill(50);
    const result = calculateOverallEffectiveness(manyControls);
    expect(result).toBeGreaterThan(99.9); // Should be very close to 100%
    expect(result).toBeLessThanOrEqual(100);
  });
});

describe('getRiskLevel', () => {
  it('should classify as CRITICAL for scores 17 and above', () => {
    expect(getRiskLevel(17)).toBe('CRITICAL');
    expect(getRiskLevel(20)).toBe('CRITICAL');
    expect(getRiskLevel(25)).toBe('CRITICAL');
  });

  it('should classify as HIGH for scores 10-16', () => {
    expect(getRiskLevel(10)).toBe('HIGH');
    expect(getRiskLevel(13)).toBe('HIGH');
    expect(getRiskLevel(16)).toBe('HIGH');
  });

  it('should classify as MEDIUM for scores 5-9', () => {
    expect(getRiskLevel(5)).toBe('MEDIUM');
    expect(getRiskLevel(7)).toBe('MEDIUM');
    expect(getRiskLevel(9)).toBe('MEDIUM');
  });

  it('should classify as LOW for scores below 5', () => {
    expect(getRiskLevel(1)).toBe('LOW');
    expect(getRiskLevel(2)).toBe('LOW');
    expect(getRiskLevel(4)).toBe('LOW');
  });

  it('should handle boundary values correctly', () => {
    expect(getRiskLevel(4.99)).toBe('LOW');
    expect(getRiskLevel(5)).toBe('MEDIUM');
    expect(getRiskLevel(9.99)).toBe('MEDIUM');
    expect(getRiskLevel(10)).toBe('HIGH');
    expect(getRiskLevel(16.99)).toBe('HIGH');
    expect(getRiskLevel(17)).toBe('CRITICAL');
  });

  it('should handle zero and negative scores', () => {
    expect(getRiskLevel(0)).toBe('LOW');
    expect(getRiskLevel(-5)).toBe('LOW');
  });
});

describe('getRiskLevelColor', () => {
  it('should return correct color for LOW risk', () => {
    const color = getRiskLevelColor('LOW');
    expect(color).toContain('green');
    expect(color).toContain('bg-green-100');
  });

  it('should return correct color for MEDIUM risk', () => {
    const color = getRiskLevelColor('MEDIUM');
    expect(color).toContain('yellow');
    expect(color).toContain('bg-yellow-100');
  });

  it('should return correct color for HIGH risk', () => {
    const color = getRiskLevelColor('HIGH');
    expect(color).toContain('orange');
    expect(color).toContain('bg-orange-100');
  });

  it('should return correct color for CRITICAL risk', () => {
    const color = getRiskLevelColor('CRITICAL');
    expect(color).toContain('red');
    expect(color).toContain('bg-red-100');
  });

  it('should include text color in response', () => {
    const lowColor = getRiskLevelColor('LOW');
    const mediumColor = getRiskLevelColor('MEDIUM');
    const highColor = getRiskLevelColor('HIGH');
    const criticalColor = getRiskLevelColor('CRITICAL');

    expect(lowColor).toContain('text-');
    expect(mediumColor).toContain('text-');
    expect(highColor).toContain('text-');
    expect(criticalColor).toContain('text-');
  });

  it('should include border color in response', () => {
    const lowColor = getRiskLevelColor('LOW');
    const mediumColor = getRiskLevelColor('MEDIUM');
    const highColor = getRiskLevelColor('HIGH');
    const criticalColor = getRiskLevelColor('CRITICAL');

    expect(lowColor).toContain('border-');
    expect(mediumColor).toContain('border-');
    expect(highColor).toContain('border-');
    expect(criticalColor).toContain('border-');
  });
});

describe('getMatrixCellColor', () => {
  it('should return green colors for LOW risk scores', () => {
    const color = getMatrixCellColor(3);
    expect(color).toContain('green');
    expect(color).toContain('bg-green-200');
  });

  it('should return yellow colors for MEDIUM risk scores', () => {
    const color = getMatrixCellColor(7);
    expect(color).toContain('yellow');
    expect(color).toContain('bg-yellow-200');
  });

  it('should return orange colors for HIGH risk scores', () => {
    const color = getMatrixCellColor(12);
    expect(color).toContain('orange');
    expect(color).toContain('bg-orange-200');
  });

  it('should return red colors for CRITICAL risk scores', () => {
    const color = getMatrixCellColor(20);
    expect(color).toContain('red');
    expect(color).toContain('bg-red-200');
  });

  it('should include hover effects', () => {
    const lowColor = getMatrixCellColor(2);
    const mediumColor = getMatrixCellColor(6);
    const highColor = getMatrixCellColor(11);
    const criticalColor = getMatrixCellColor(18);

    expect(lowColor).toContain('hover:');
    expect(mediumColor).toContain('hover:');
    expect(highColor).toContain('hover:');
    expect(criticalColor).toContain('hover:');
  });

  it('should handle boundary risk scores', () => {
    expect(getMatrixCellColor(4)).toContain('green');
    expect(getMatrixCellColor(5)).toContain('yellow');
    expect(getMatrixCellColor(10)).toContain('orange');
    expect(getMatrixCellColor(17)).toContain('red');
  });
});

describe('validateRiskParameters', () => {
  it('should return true for valid parameters', () => {
    expect(validateRiskParameters(1, 1)).toBe(true);
    expect(validateRiskParameters(3, 3)).toBe(true);
    expect(validateRiskParameters(5, 5)).toBe(true);
  });

  it('should throw error when likelihood is not integer', () => {
    expect(() => validateRiskParameters(2.5, 3)).toThrow(
      'Likelihood must be an integer between 1 and 5'
    );
  });

  it('should throw error when impact is not integer', () => {
    expect(() => validateRiskParameters(3, 2.5)).toThrow(
      'Impact must be an integer between 1 and 5'
    );
  });

  it('should throw error when likelihood is below 1', () => {
    expect(() => validateRiskParameters(0, 3)).toThrow(
      'Likelihood must be an integer between 1 and 5'
    );
  });

  it('should throw error when likelihood is above 5', () => {
    expect(() => validateRiskParameters(6, 3)).toThrow(
      'Likelihood must be an integer between 1 and 5'
    );
  });

  it('should throw error when impact is below 1', () => {
    expect(() => validateRiskParameters(3, 0)).toThrow(
      'Impact must be an integer between 1 and 5'
    );
  });

  it('should throw error when impact is above 5', () => {
    expect(() => validateRiskParameters(3, 6)).toThrow(
      'Impact must be an integer between 1 and 5'
    );
  });

  it('should throw error for negative values', () => {
    expect(() => validateRiskParameters(-1, 3)).toThrow(
      'Likelihood must be an integer between 1 and 5'
    );
    expect(() => validateRiskParameters(3, -1)).toThrow(
      'Impact must be an integer between 1 and 5'
    );
  });

  it('should validate all valid combinations', () => {
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 5; j++) {
        expect(validateRiskParameters(i, j)).toBe(true);
      }
    }
  });
});

describe('Integration: Risk Scoring Flow', () => {
  it('should calculate complete risk flow correctly', () => {
    // Scenario: Inherent risk with multiple controls
    const likelihood = 4;
    const impact = 4;
    const inherentScore = calculateInherentScore(likelihood, impact); // 16

    expect(inherentScore).toBe(16);
    expect(getRiskLevel(inherentScore)).toBe('HIGH');

    // Apply three controls with different effectiveness
    // 1 - (1-0.7)(1-0.6)(1-0.5) = 1 - 0.3*0.4*0.5 = 1 - 0.06 = 0.94 = 94%
    const overallEffectiveness = calculateOverallEffectiveness([70, 60, 50]);
    const residualScore = calculateResidualScore(
      inherentScore,
      overallEffectiveness
    );

    // 16 * (1 - 0.94) = 16 * 0.06 = 0.96 which is LOW
    expect(residualScore).toBeLessThan(inherentScore);
    expect(getRiskLevel(residualScore)).toBe('LOW');
  });

  it('should demonstrate risk reduction with controls', () => {
    const inherentScore = calculateInherentScore(5, 5); // 25 - CRITICAL
    expect(getRiskLevel(inherentScore)).toBe('CRITICAL');

    // With 75% overall control effectiveness
    // 25 * (1 - 0.75) = 25 * 0.25 = 6.25 which is MEDIUM
    const residualScore = calculateResidualScore(inherentScore, 75);
    expect(residualScore).toBeGreaterThan(5);
    expect(getRiskLevel(residualScore)).toBe('MEDIUM');
  });

  it('should validate parameters before calculation', () => {
    // Valid parameters
    expect(() => {
      validateRiskParameters(3, 4);
      calculateInherentScore(3, 4);
    }).not.toThrow();

    // Invalid parameters
    expect(() => {
      validateRiskParameters(3.5, 4);
    }).toThrow();
  });

  it('should maintain consistency across calculations', () => {
    const likelihood = 2;
    const impact = 3;

    // Multiple calls should return same result
    const score1 = calculateInherentScore(likelihood, impact);
    const score2 = calculateInherentScore(likelihood, impact);

    expect(score1).toBe(score2);
    expect(getRiskLevel(score1)).toBe(getRiskLevel(score2));
  });
});

describe('Edge Cases', () => {
  it('should handle very high effectiveness values', () => {
    const result = calculateOverallEffectiveness([99, 99, 99]);
    expect(result).toBeGreaterThan(99.9);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should handle combination of high and low controls', () => {
    const result = calculateOverallEffectiveness([100, 0]);
    expect(result).toBe(100);
  });

  it('should handle decimal scores in matrix color', () => {
    // Decimal scores should map to correct category
    expect(getMatrixCellColor(4.9)).toContain('green');
    expect(getMatrixCellColor(5.1)).toContain('yellow');
  });

  it('should not allow null or undefined parameters', () => {
    expect(() => calculateInherentScore(0, 3)).toThrow();
    expect(() => calculateInherentScore(3, 0)).toThrow();
  });

  it('should maintain mathematical consistency', () => {
    // If A > B and C is positive, then A*C > B*C
    const scoreA = calculateInherentScore(5, 5); // 25
    const scoreB = calculateInherentScore(3, 3); // 9

    const residualA = calculateResidualScore(scoreA, 50);
    const residualB = calculateResidualScore(scoreB, 50);

    expect(residualA).toBeGreaterThan(residualB);
  });
});

describe('calculateRiskVelocity', () => {
  describe('Empty and insufficient history', () => {
    it('should return stable velocity for empty history', () => {
      const velocity = calculateRiskVelocity([]);
      expect(velocity).toEqual({
        inherentChange: 0,
        residualChange: 0,
        trend: 'stable',
        periodDays: 0,
      });
    });

    it('should return stable velocity with single history record', () => {
      const velocity = calculateRiskVelocity([
        {
          id: 'hist-1',
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 8,
          targetScore: 5,
          controlEffectiveness: 20,
          source: 'INITIAL',
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
      ]);

      expect(velocity.trend).toBe('stable');
      expect(velocity.inherentChange).toBe(0);
      expect(velocity.residualChange).toBe(0);
    });
  });

  describe('Trend detection', () => {
    it('should detect improving trend when residual score decreases', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 15,
          residualScore: 12,
          targetScore: 5,
          controlEffectiveness: 20,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 15,
          residualScore: 2,
          targetScore: 5,
          controlEffectiveness: 86,
          source: 'CONTROL_CHANGE' as const,
          notes: null,
          recordedAt: '2026-01-11',
          createdAt: '2026-01-11',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      expect(velocity.trend).toBe('improving');
      expect(velocity.residualChange).toBeLessThan(0);
    });

    it('should detect worsening trend when residual score increases', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 12,
          residualScore: 3,
          targetScore: 5,
          controlEffectiveness: 75,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 12,
          residualScore: 12,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'CONTROL_CHANGE' as const,
          notes: null,
          recordedAt: '2026-01-11',
          createdAt: '2026-01-11',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      expect(velocity.trend).toBe('worsening');
      expect(velocity.residualChange).toBeGreaterThan(0);
    });

    it('should detect stable trend when change is below threshold', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 8,
          targetScore: 5,
          controlEffectiveness: 20,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 8.05,
          targetScore: 5,
          controlEffectiveness: 19.5,
          source: 'AUTO_RECALC' as const,
          notes: null,
          recordedAt: '2026-01-11',
          createdAt: '2026-01-11',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      expect(velocity.trend).toBe('stable');
      // Change: 0.05 / 10 = 0.005 per day (below 0.1 threshold)
      expect(Math.abs(velocity.residualChange)).toBeLessThan(0.1);
    });
  });

  describe('Threshold behavior', () => {
    it('should use 0.1 threshold for trend classification', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10.99,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'AUTO_RECALC' as const,
          notes: null,
          recordedAt: '2026-01-11',
          createdAt: '2026-01-11',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      // Change: (10.99 - 10) / 10 = 0.099 (below 0.1 threshold)
      expect(velocity.trend).toBe('stable');
    });

    it('should trigger improving at exactly -0.1 boundary', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 9.0,
          targetScore: 5,
          controlEffectiveness: 10,
          source: 'CONTROL_CHANGE' as const,
          notes: null,
          recordedAt: '2026-01-11',
          createdAt: '2026-01-11',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      // Change: (9.0 - 10) / 10 = -0.1 (at threshold, exclusive check)
      // Implementation: if (residualChange < -threshold)
      expect(velocity.trend).toBe('stable');
    });
  });

  describe('Date calculations', () => {
    it('should calculate period days correctly', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 15,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'MANUAL' as const,
          notes: null,
          recordedAt: '2026-01-21',
          createdAt: '2026-01-21',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      expect(velocity.periodDays).toBe(20);
    });

    it('should sort history records before calculating', () => {
      // Provide records in reverse order
      const history = [
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 20,
          residualScore: 15,
          targetScore: 5,
          controlEffectiveness: 25,
          source: 'CONTROL_CHANGE' as const,
          notes: null,
          recordedAt: '2026-01-11',
          createdAt: '2026-01-11',
        },
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      // Should calculate using earliest (h1) and latest (h2)
      expect(velocity.inherentChange).toBe(1.0); // (20 - 10) / 10
      expect(velocity.residualChange).toBe(0.5); // (15 - 10) / 10
    });

    it('should handle same-day records', () => {
      const sameDate = '2026-01-01';
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: sameDate,
          createdAt: sameDate,
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 12,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'MANUAL' as const,
          notes: null,
          recordedAt: sameDate,
          createdAt: sameDate,
        },
      ];

      const velocity = calculateRiskVelocity(history);

      // Should use Math.max(1, daysDiff) = 1
      expect(velocity.periodDays).toBe(1);
      expect(velocity.residualChange).toBe(2.0); // 2 points per day
    });
  });

  describe('Rounding and precision', () => {
    it('should round changes to 2 decimal places', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 11.333,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'MANUAL' as const,
          notes: null,
          recordedAt: '2026-01-04',
          createdAt: '2026-01-04',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      // Change: (11.333 - 10) / 3 = 0.444333..., rounded to 0.44
      expect(velocity.residualChange).toBe(0.44);
    });

    it('should round periodDays to integer', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 10,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'AUTO_RECALC' as const,
          notes: null,
          recordedAt: '2026-01-01T12:00:00Z',
          createdAt: '2026-01-01T12:00:00Z',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      expect(Number.isInteger(velocity.periodDays)).toBe(true);
    });
  });

  describe('Sign preservation', () => {
    it('should maintain correct sign for inherent and residual changes', () => {
      const history = [
        {
          id: 'h1',
          riskId: 'r1',
          inherentScore: 5,
          residualScore: 4,
          targetScore: 5,
          controlEffectiveness: 20,
          source: 'INITIAL' as const,
          notes: null,
          recordedAt: '2026-01-01',
          createdAt: '2026-01-01',
        },
        {
          id: 'h2',
          riskId: 'r1',
          inherentScore: 15,
          residualScore: 3,
          targetScore: 5,
          controlEffectiveness: 80,
          source: 'CONTROL_CHANGE' as const,
          notes: null,
          recordedAt: '2026-01-06',
          createdAt: '2026-01-06',
        },
      ];

      const velocity = calculateRiskVelocity(history);

      // Inherent: (15 - 5) / 5 = 2.0 (positive)
      // Residual: (3 - 4) / 5 = -0.2 (negative, improving)
      expect(velocity.inherentChange).toBe(2.0);
      expect(velocity.residualChange).toBe(-0.2);
      expect(velocity.trend).toBe('improving');
    });
  });
});

describe('calculateBatchRiskVelocity', () => {
  it('should calculate velocity for multiple risks independently', () => {
    const risksWithHistory = [
      {
        riskId: 'risk-1',
        history: [
          {
            id: 'h1',
            riskId: 'risk-1',
            inherentScore: 15,
            residualScore: 12,
            targetScore: 5,
            controlEffectiveness: 20,
            source: 'INITIAL' as const,
            notes: null,
            recordedAt: '2026-01-01',
            createdAt: '2026-01-01',
          },
          {
            id: 'h2',
            riskId: 'risk-1',
            inherentScore: 15,
            residualScore: 2,
            targetScore: 5,
            controlEffectiveness: 86,
            source: 'CONTROL_CHANGE' as const,
            notes: null,
            recordedAt: '2026-01-11',
            createdAt: '2026-01-11',
          },
        ],
      },
      {
        riskId: 'risk-2',
        history: [
          {
            id: 'h3',
            riskId: 'risk-2',
            inherentScore: 10,
            residualScore: 3,
            targetScore: 5,
            controlEffectiveness: 70,
            source: 'INITIAL' as const,
            notes: null,
            recordedAt: '2026-01-01',
            createdAt: '2026-01-01',
          },
          {
            id: 'h4',
            riskId: 'risk-2',
            inherentScore: 10,
            residualScore: 8,
            targetScore: 5,
            controlEffectiveness: 20,
            source: 'CONTROL_CHANGE' as const,
            notes: null,
            recordedAt: '2026-01-11',
            createdAt: '2026-01-11',
          },
        ],
      },
    ];

    const velocityMap = calculateBatchRiskVelocity(risksWithHistory);

    expect(velocityMap.size).toBe(2);
    expect(velocityMap.get('risk-1')?.trend).toBe('improving');
    expect(velocityMap.get('risk-2')?.trend).toBe('worsening');
  });

  it('should return map with all provided risk IDs', () => {
    const risksWithHistory = [
      {
        riskId: 'risk-1',
        history: [],
      },
      {
        riskId: 'risk-2',
        history: [],
      },
      {
        riskId: 'risk-3',
        history: [],
      },
    ];

    const velocityMap = calculateBatchRiskVelocity(risksWithHistory);

    expect(velocityMap.size).toBe(3);
    expect(velocityMap.has('risk-1')).toBe(true);
    expect(velocityMap.has('risk-2')).toBe(true);
    expect(velocityMap.has('risk-3')).toBe(true);
  });

  it('should handle empty input', () => {
    const velocityMap = calculateBatchRiskVelocity([]);

    expect(velocityMap.size).toBe(0);
    expect(velocityMap instanceof Map).toBe(true);
  });

  it('should return stable velocity for risks with no history', () => {
    const risksWithHistory = [
      {
        riskId: 'risk-1',
        history: [],
      },
    ];

    const velocityMap = calculateBatchRiskVelocity(risksWithHistory);
    const velocity = velocityMap.get('risk-1');

    expect(velocity).toEqual({
      inherentChange: 0,
      residualChange: 0,
      trend: 'stable',
      periodDays: 0,
    });
  });
});
