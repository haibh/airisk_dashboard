'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, Info } from 'lucide-react';
import { useControlRiskFlowData } from '@/hooks/use-control-risk-flow-data';

interface ControlRiskSankeyDiagramChartProps {
  frameworkOptions?: { id: string; name: string }[];
  categoryOptions?: string[];
}

// Color based on effectiveness
function getEffectivenessColor(effectiveness: number): string {
  if (effectiveness >= 70) return '#22c55e'; // Green
  if (effectiveness >= 40) return '#eab308'; // Yellow
  return '#ef4444'; // Red
}

export function ControlRiskSankeyDiagramChart({
  frameworkOptions = [],
  categoryOptions = [],
}: ControlRiskSankeyDiagramChartProps) {
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [riskCategory, setRiskCategory] = useState<string>('');

  const { data, isLoading, error } = useControlRiskFlowData({
    frameworkId: frameworkId || undefined,
    riskCategory: riskCategory || undefined,
    limit: 50,
  });

  // Simple visual representation since Recharts Sankey can be complex
  const flowData = useMemo(() => {
    if (!data || data.links.length === 0) return null;

    // Group links by control
    const controlGroups = new Map<
      string,
      { control: string; risks: { name: string; effectiveness: number }[] }
    >();

    for (const link of data.links) {
      const controlNode = data.nodes.find((n) => n.id === link.controlId);
      const riskNode = data.nodes.find((n) => n.id === link.riskId);

      if (controlNode && riskNode) {
        const existing = controlGroups.get(link.controlId) || {
          control: controlNode.name,
          risks: [],
        };
        existing.risks.push({
          name: riskNode.name,
          effectiveness: link.effectiveness,
        });
        controlGroups.set(link.controlId, existing);
      }
    }

    return Array.from(controlGroups.values()).slice(0, 10);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Control → Risk Mitigation Flow
          </CardTitle>
          <div className="flex items-center gap-2">
            {frameworkOptions.length > 0 && (
              <Select value={frameworkId} onValueChange={setFrameworkId}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="All Frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Frameworks</SelectItem>
                  {frameworkOptions.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>
                      {fw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {categoryOptions.length > 0 && (
              <Select value={riskCategory} onValueChange={setRiskCategory}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        {data && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.totalControls} controls → {data.totalRisks} risks | Avg effectiveness:{' '}
            {data.avgEffectiveness}%
          </p>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        ) : !flowData || flowData.length === 0 ? (
          <div className="text-center py-8">
            <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No control-risk mappings found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Link controls to risks in assessments to see the flow
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flowData.map((group, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {/* Control */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded px-2 py-1">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">
                        {group.control}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-muted-foreground">→</div>

                  {/* Risks */}
                  <div className="flex-1 space-y-1">
                    {group.risks.slice(0, 3).map((risk, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-center justify-between gap-2 bg-purple-100 dark:bg-purple-900/30 rounded px-2 py-1"
                      >
                        <p className="text-xs text-purple-800 dark:text-purple-200 truncate flex-1">
                          {risk.name}
                        </p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: getEffectivenessColor(risk.effectiveness) + '20',
                            color: getEffectivenessColor(risk.effectiveness),
                          }}
                        >
                          {risk.effectiveness}%
                        </span>
                      </div>
                    ))}
                    {group.risks.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{group.risks.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
                <span>High (70%+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />
                <span>Medium (40-69%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
                <span>Low (&lt;40%)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
