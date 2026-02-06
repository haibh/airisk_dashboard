'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { HeatmapCellRisk } from '@/types/dashboard';

interface RiskHeatmapDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likelihood: number;
  impact: number;
  onViewTrajectory?: (riskId: string) => void;
}

const LIKELIHOOD_LABELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const IMPACT_LABELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

function getTreatmentBadgeColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
    case 'MITIGATING':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
    case 'ACCEPTED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200';
  }
}

function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    BIAS_FAIRNESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    PRIVACY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    SECURITY: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    RELIABILITY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    TRANSPARENCY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
    ACCOUNTABILITY: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
    SAFETY: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
    OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200',
  };
  return colors[category] || colors.OTHER;
}

export function RiskHeatmapDrilldownModal({
  open,
  onOpenChange,
  likelihood,
  impact,
  onViewTrajectory,
}: RiskHeatmapDrilldownModalProps) {
  const [risks, setRisks] = useState<HeatmapCellRisk[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchCellRisks() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard/risk-heatmap/cell?likelihood=${likelihood}&impact=${impact}`
        );
        if (res.ok) {
          const data = await res.json();
          setRisks(data.risks || []);
        }
      } catch {
        setRisks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCellRisks();
  }, [open, likelihood, impact]);

  const score = likelihood * impact;
  const levelColor =
    score >= 17
      ? 'text-red-600'
      : score >= 10
        ? 'text-orange-600'
        : score >= 5
          ? 'text-yellow-600'
          : 'text-green-600';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl !bg-white dark:!bg-slate-900 border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Risks at L{likelihood} × I{impact}
            <span className={`font-bold ${levelColor}`}>(Score: {score})</span>
          </DialogTitle>
          <DialogDescription>
            Likelihood: {LIKELIHOOD_LABELS[likelihood - 1]} | Impact: {IMPACT_LABELS[impact - 1]}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : risks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No risks at this intersection
            </p>
          ) : (
            <div className="space-y-2 p-1">
              {risks.map((risk) => (
                <div
                  key={risk.id}
                  className="border border-border bg-gray-50 dark:bg-slate-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">{risk.title}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {risk.aiSystemName} • {risk.assessmentTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {onViewTrajectory && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => {
                            onViewTrajectory(risk.id);
                            onOpenChange(false);
                          }}
                          title="View risk trajectory"
                        >
                          <TrendingUp className="h-3 w-3" />
                        </Button>
                      )}
                      <Link href={`/risk-assessment?riskId=${risk.id}`}>
                        <Button variant="outline" size="sm" className="h-7 px-2" title="View details">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${getCategoryBadgeColor(risk.category)}`}
                    >
                      {risk.category.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${getTreatmentBadgeColor(risk.treatmentStatus)}`}
                    >
                      {risk.treatmentStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto font-medium">
                      Residual: {risk.residualScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
