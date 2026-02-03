'use client';

import { RiskWithControls, RiskMatrix } from '@/types/risk-assessment';
import {
  calculateInherentScore,
  getRiskLevel,
  getMatrixCellColor,
} from '@/lib/risk-scoring-calculator';
import { useTranslations } from 'next-intl';

interface RiskMatrixVisualizationProps {
  risks: RiskWithControls[];
  onCellClick?: (likelihood: number, impact: number) => void;
}

/**
 * Build 5x5 risk matrix from risks
 */
function buildRiskMatrix(risks: RiskWithControls[]): RiskMatrix {
  const matrix: RiskMatrix = [];

  // Initialize 5x5 matrix (impact on Y-axis, likelihood on X-axis)
  for (let impact = 5; impact >= 1; impact--) {
    const row = [];
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const score = calculateInherentScore(likelihood, impact);
      const level = getRiskLevel(score);
      const cellRisks = risks.filter(
        r => r.likelihood === likelihood && r.impact === impact
      );

      row.push({
        likelihood,
        impact,
        score,
        level,
        count: cellRisks.length,
        risks: cellRisks.map(r => r.id),
      });
    }
    matrix.push(row);
  }

  return matrix;
}

export function RiskMatrixVisualization({
  risks,
  onCellClick,
}: RiskMatrixVisualizationProps) {
  const t = useTranslations();
  const matrix = buildRiskMatrix(risks);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Matrix grid */}
          <div className="grid grid-cols-6 gap-1">
            {/* Top-left corner cell */}
            <div className="h-20 flex items-center justify-center text-xs font-semibold">
              Impact →<br />↓ Likelihood
            </div>

            {/* Likelihood headers (1-5) */}
            {[1, 2, 3, 4, 5].map(val => (
              <div
                key={`like-${val}`}
                className="h-20 flex items-center justify-center border border-gray-300 bg-gray-50 text-sm font-semibold"
              >
                {val}
              </div>
            ))}

            {/* Matrix rows */}
            {matrix.map((row, rowIdx) => (
              <>
                {/* Impact label */}
                <div
                  key={`impact-${5 - rowIdx}`}
                  className="h-20 flex items-center justify-center border border-gray-300 bg-gray-50 text-sm font-semibold"
                >
                  {5 - rowIdx}
                </div>

                {/* Matrix cells */}
                {row.map((cell, colIdx) => (
                  <button
                    key={`cell-${rowIdx}-${colIdx}`}
                    onClick={() =>
                      onCellClick?.(cell.likelihood, cell.impact)
                    }
                    className={`h-20 flex flex-col items-center justify-center border-2 transition-all ${getMatrixCellColor(
                      cell.score
                    )} ${
                      onCellClick ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    title={`Likelihood: ${cell.likelihood}, Impact: ${cell.impact}, Score: ${cell.score}`}
                  >
                    <span className="text-lg font-bold">{cell.score}</span>
                    {cell.count > 0 && (
                      <span className="text-xs mt-1">
                        {cell.count} risk{cell.count > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-200 border border-green-300" />
          <span>Low (1-4)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-200 border border-yellow-300" />
          <span>Medium (5-9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-200 border border-orange-300" />
          <span>High (10-16)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-200 border border-red-300" />
          <span>Critical (17-25)</span>
        </div>
      </div>
    </div>
  );
}
