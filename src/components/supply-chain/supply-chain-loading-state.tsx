'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SupplyChainLoadingState() {
  return (
    <div className="h-screen p-6 space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-[calc(100vh-8rem)] w-full" />
    </div>
  );
}
