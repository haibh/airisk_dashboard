'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const LIFECYCLE_STAGES = ['Development', 'Pilot', 'Production', 'Deprecated', 'Retired'] as const;

function getStageColor(stage: string, isActive: boolean): string {
  if (!isActive) return 'bg-muted text-muted-foreground';
  switch (stage) {
    case 'Development': return 'bg-blue-500 text-white';
    case 'Pilot': return 'bg-yellow-500 text-white';
    case 'Production': return 'bg-green-500 text-white';
    case 'Deprecated': return 'bg-orange-500 text-white';
    case 'Retired': return 'bg-muted-foreground text-white';
    default: return 'bg-primary text-white';
  }
}

interface ModelLifecycleIndicatorsProps {
  currentStage: string | null;
  isLoading?: boolean;
}

export function ModelLifecycleIndicators({ currentStage, isLoading }: ModelLifecycleIndicatorsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const normalizedStage = currentStage
    ? LIFECYCLE_STAGES.find(s => s.toLowerCase() === currentStage.toLowerCase()) || null
    : null;
  const activeIdx = normalizedStage ? LIFECYCLE_STAGES.indexOf(normalizedStage) : -1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Model Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        {!currentStage ? (
          <p className="text-sm text-muted-foreground">Select a model to view lifecycle</p>
        ) : (
          <div className="flex items-center gap-1">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = idx <= activeIdx;
              return (
                <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-full h-2 rounded-full transition-colors',
                      getStageColor(stage, isPast)
                    )}
                  />
                  <span className={cn(
                    'text-[10px]',
                    idx === activeIdx ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  )}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
