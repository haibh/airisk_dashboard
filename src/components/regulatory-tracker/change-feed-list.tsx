'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statusColors, impactColors, RegulatoryStatus, ImpactLevel } from './regulatory-tracker-constants';
import type { RegulatoryChange, ChangeFeedFilters } from './regulatory-tracker-types';

interface ChangeFeedListProps {
  changes: RegulatoryChange[];
  onSelect: (change: RegulatoryChange) => void;
  filters: ChangeFeedFilters;
  onFiltersChange: (filters: ChangeFeedFilters) => void;
  isLoading?: boolean;
}

export function ChangeFeedList({
  changes,
  onSelect,
  filters,
  onFiltersChange,
  isLoading = false,
}: ChangeFeedListProps) {
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-5/6 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No regulatory changes found
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Try adjusting your filters or check back later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h3 className="text-sm font-medium">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </CardHeader>
        {showFilters && (
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Status</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    status: e.target.value as RegulatoryStatus | undefined,
                  })
                }
              >
                <option value="">All Statuses</option>
                <option value="PROPOSED">Proposed</option>
                <option value="ENACTED">Enacted</option>
                <option value="ACTIVE">Active</option>
                <option value="SUPERSEDED">Superseded</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block">
                Impact Level
              </label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={filters.impactLevel || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    impactLevel: e.target.value as ImpactLevel | undefined,
                  })
                }
              >
                <option value="">All Impact Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
        <div className="space-y-6">
          {changes.map((change, index) => (
            <div key={change.id} className="relative pl-10">
              <div className="absolute left-2.5 top-2 h-3 w-3 rounded-full bg-primary border-2 border-background"></div>
              <Card
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelect(change)}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-base leading-tight flex-1">
                      {change.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn('border', statusColors[change.status])}>
                        {change.status}
                      </Badge>
                      <Badge
                        className={cn('border', impactColors[change.impactLevel])}
                      >
                        {change.impactLevel}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Effective: {formatDate(change.effectiveDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{change.source}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {change.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
