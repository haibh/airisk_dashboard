'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AISystemSummary {
  id: string;
  name: string;
  type: string;
  riskTier: string;
  lifecycleStatus: string;
}

interface AIModelRegistryProps {
  systems: AISystemSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

function getRiskTierColor(tier: string): string {
  switch (tier.toUpperCase()) {
    case 'CRITICAL': return 'border-red-500 text-red-500';
    case 'HIGH': return 'border-orange-500 text-orange-500';
    case 'MEDIUM': return 'border-yellow-500 text-yellow-500';
    default: return 'border-green-500 text-green-500';
  }
}

export function AIModelRegistry({ systems, selectedId, onSelect, isLoading }: AIModelRegistryProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          AI Model Registry
        </CardTitle>
      </CardHeader>
      <CardContent>
        {systems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No AI systems registered</p>
        ) : (
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto scrollbar-thin">
            {systems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => onSelect(sys.id)}
                className={cn(
                  'w-full text-left rounded-lg border p-2.5 transition-colors',
                  selectedId === sys.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:bg-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{sys.name}</span>
                  <Badge variant="outline" className={getRiskTierColor(sys.riskTier)}>
                    {sys.riskTier}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sys.type} &middot; {sys.lifecycleStatus}
                </p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
