'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, FileText, TrendingUp } from 'lucide-react';
import { ChangeFeedList } from './change-feed-list';
import { ImpactAssessmentCard } from './impact-assessment-card';
import { AffectedControlsTree } from './affected-controls-tree';
import type { RegulatoryChange, RegulatoryChangeDetail, ChangeFeedFilters } from './regulatory-tracker-types';

export function RegulatoryTrackerDashboardPage() {
  const [changes, setChanges] = useState<RegulatoryChange[]>([]);
  const [selectedChange, setSelectedChange] = useState<RegulatoryChangeDetail | null>(null);
  const [filters, setFilters] = useState<ChangeFeedFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pendingAcknowledgments: 0,
    highImpact: 0,
  });

  // Fetch changes list
  useEffect(() => {
    fetchChanges();
  }, [filters]);

  const fetchChanges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.impactLevel) params.append('impactLevel', filters.impactLevel);

      const response = await fetch(`/api/regulatory-changes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch regulatory changes');
      }

      const data = await response.json();
      setChanges(data.items || []);

      // Calculate stats
      const total = data.items?.length || 0;
      const pendingAcknowledgments = data.items?.filter((c: RegulatoryChange & { acknowledged?: boolean }) => !c.acknowledged).length || 0;
      const highImpact = data.items?.filter((c: RegulatoryChange) => c.impactLevel === 'HIGH' || c.impactLevel === 'CRITICAL').length || 0;

      setStats({ total, pendingAcknowledgments, highImpact });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch change detail
  const handleSelectChange = async (change: RegulatoryChange) => {
    try {
      const response = await fetch(`/api/regulatory-changes/${change.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch change details');
      }
      const data = await response.json();
      setSelectedChange(data);
    } catch (err) {
      console.error('Error fetching change details:', err);
    }
  };

  // Assess impact
  const handleAssessImpact = async (changeId: string) => {
    try {
      const response = await fetch(`/api/regulatory-changes/${changeId}/assess-impact`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to assess impact');
      }
      const data = await response.json();
      setSelectedChange(data);
    } catch (err) {
      console.error('Error assessing impact:', err);
      throw err;
    }
  };

  // Acknowledge change
  const handleAcknowledge = async (changeId: string) => {
    try {
      const response = await fetch(`/api/regulatory-changes/${changeId}/acknowledge`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to acknowledge change');
      }
      const data = await response.json();
      setSelectedChange(data);
      // Refresh list
      fetchChanges();
    } catch (err) {
      console.error('Error acknowledging change:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regulatory Change Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and assess regulatory changes affecting your compliance frameworks
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All regulatory changes tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Acknowledgments</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAcknowledgments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require review and acknowledgment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.highImpact}</div>
            <p className="text-xs text-muted-foreground mt-1">
              High or critical impact level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="py-4">
            <p className="text-sm text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Change Feed (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <ChangeFeedList
            changes={changes}
            onSelect={handleSelectChange}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Detail Panel (1/3 width on desktop) */}
        <div className="space-y-4">
          <ImpactAssessmentCard
            change={selectedChange}
            onAssessImpact={handleAssessImpact}
            onAcknowledge={handleAcknowledge}
          />
          {selectedChange?.frameworkChanges && selectedChange.frameworkChanges.length > 0 && (
            <AffectedControlsTree frameworkChanges={selectedChange.frameworkChanges} />
          )}
        </div>
      </div>
    </div>
  );
}
