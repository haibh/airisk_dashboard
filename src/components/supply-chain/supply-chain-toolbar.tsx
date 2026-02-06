'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Network, RefreshCw } from 'lucide-react';

interface SupplyChainToolbarProps {
  nodeCount: number;
  tierFilter: string;
  riskFilter: string;
  onTierFilterChange: (value: string) => void;
  onRiskFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export function SupplyChainToolbar({
  nodeCount,
  tierFilter,
  riskFilter,
  onTierFilterChange,
  onRiskFilterChange,
  onRefresh,
}: SupplyChainToolbarProps) {
  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Supply Chain Visualization</h1>
          <Badge variant="outline">{nodeCount} Vendors</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select value={tierFilter} onValueChange={onTierFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
              <SelectItem value="3">Tier 3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={onRiskFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Risks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="low">Low (≤5)</SelectItem>
              <SelectItem value="medium">Medium (6-10)</SelectItem>
              <SelectItem value="high">High (11-15)</SelectItem>
              <SelectItem value="critical">Critical (16+)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onRefresh} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
