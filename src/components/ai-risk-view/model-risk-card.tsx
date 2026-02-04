'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import type { AISystemSummary } from '@/components/ai-risk-view/ai-model-registry';

interface ModelRiskCardProps {
  system: AISystemSummary | null;
  isLoading?: boolean;
}

function getRiskBadgeStyle(tier: string): string {
  switch (tier.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-500 text-white hover:bg-red-600';
    case 'HIGH': return 'bg-orange-500 text-white hover:bg-orange-600';
    case 'MEDIUM': return 'bg-yellow-500 text-white hover:bg-yellow-600';
    default: return 'bg-green-500 text-white hover:bg-green-600';
  }
}

export function ModelRiskCard({ system, isLoading }: ModelRiskCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (!system) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Model Detail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a model from the registry</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Model Detail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">{system.name}</h3>
          <Badge className={`mt-1 ${getRiskBadgeStyle(system.riskTier)}`}>
            {system.riskTier} Risk
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium">{system.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lifecycle</p>
            <p className="font-medium">{system.lifecycleStatus}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
