'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskPath {
  sourceVendorId: string;
  sourceVendorName: string;
  targetVendorId: string;
  targetVendorName: string;
  riskScore: number;
  propagationFactor: number;
  propagatedRisk: number;
  path: string[];
}

interface VendorRiskHeatmapOverlayProps {
  riskPaths: RiskPath[];
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export function VendorRiskHeatmapOverlay({
  riskPaths,
  isVisible,
  onToggle,
  className,
}: VendorRiskHeatmapOverlayProps) {
  const sortedPaths = useMemo(() => {
    return [...riskPaths].sort((a, b) => b.propagatedRisk - a.propagatedRisk);
  }, [riskPaths]);

  const getRiskColor = (score: number) => {
    if (score <= 5) return 'text-green-600 dark:text-green-400';
    if (score <= 10) return 'text-yellow-600 dark:text-yellow-400';
    if (score <= 15) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score <= 5) return 'secondary';
    if (score <= 10) return 'outline';
    if (score <= 15) return 'default';
    return 'destructive';
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
      >
        <AlertTriangle className="w-4 h-4" />
        Show Risk Propagation
      </Button>
    );
  }

  return (
    <Card className={cn('w-full max-w-md shadow-lg', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            Risk Propagation Paths
          </CardTitle>
          <Button onClick={onToggle} variant="ghost" size="icon" className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
        {sortedPaths.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No risk propagation paths detected
          </p>
        ) : (
          sortedPaths.map((path, index) => (
            <div
              key={`${path.sourceVendorId}-${path.targetVendorId}-${index}`}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{path.sourceVendorName}</p>
                  <p className="text-xs text-muted-foreground">Source Vendor</p>
                </div>
                <Badge variant={getRiskBadgeVariant(path.riskScore)} className="shrink-0">
                  Risk: {path.riskScore}
                </Badge>
              </div>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  Factor: {(path.propagationFactor * 100).toFixed(0)}%
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{path.targetVendorName}</p>
                  <p className="text-xs text-muted-foreground">Target Vendor</p>
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-bold', getRiskColor(path.propagatedRisk))}>
                    {path.propagatedRisk.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Propagated</p>
                </div>
              </div>

              {path.path && path.path.length > 2 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Path: {path.path.join(' → ')}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
