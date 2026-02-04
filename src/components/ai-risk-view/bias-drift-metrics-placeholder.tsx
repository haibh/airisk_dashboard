'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, TrendingUp } from 'lucide-react';

export function BiasDriftMetricsPlaceholder() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Beaker className="h-4 w-4" />
            Bias Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Coming Soon — Requires MLOps Integration
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Fairness metrics, demographic parity, equalized odds monitoring
          </p>
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Model Drift
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Coming Soon — Requires MLOps Integration
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Data drift detection, prediction drift, feature importance shifts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
