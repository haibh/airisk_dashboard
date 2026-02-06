'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Plus, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScenarioResult {
  id: string;
  name: string;
  controlsCount: number;
  totalInvestment: number;
  annualSavings: number;
  rosi: number;
  paybackMonths: number;
}

interface ScenarioComparisonTableProps {
  scenarios: ScenarioResult[];
  onAddScenario?: () => void;
  onRemoveScenario?: (id: string) => void;
}

type SortField = keyof ScenarioResult;
type SortDirection = 'asc' | 'desc';

export function ScenarioComparisonTable({
  scenarios,
  onAddScenario,
  onRemoveScenario,
}: ScenarioComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('rosi');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedScenarios = [...scenarios].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    const aNum = Number(aVal);
    const bNum = Number(bVal);
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const bestScenario = scenarios.reduce(
    (best, current) => (current.rosi > best.rosi ? current : best),
    scenarios[0]
  );

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPayback = (months: number) => {
    if (months === Infinity || months < 0) return 'Never';
    if (months < 1) return '< 1 mo';
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    if (years > 0) {
      return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
    }
    return `${remainingMonths} mo`;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 font-semibold hover:bg-muted"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    </TableHead>
  );

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Scenario Comparison
            </span>
            {onAddScenario && (
              <Button onClick={onAddScenario} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Scenario
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No scenarios to compare yet.</p>
            <p className="text-xs mt-2">Add multiple scenarios to compare ROI outcomes side-by-side.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Scenario Comparison
            <Badge variant="secondary">{scenarios.length} scenarios</Badge>
          </span>
          {onAddScenario && (
            <Button onClick={onAddScenario} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Scenario
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Scenario Name</SortableHeader>
                <SortableHeader field="controlsCount">Controls</SortableHeader>
                <SortableHeader field="totalInvestment">Total Investment</SortableHeader>
                <SortableHeader field="annualSavings">Annual Savings</SortableHeader>
                <SortableHeader field="rosi">ROSI %</SortableHeader>
                <SortableHeader field="paybackMonths">Payback</SortableHeader>
                {onRemoveScenario && <TableHead className="w-[60px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedScenarios.map((scenario) => {
                const isBest = bestScenario && scenario.id === bestScenario.id;
                const isPositiveROI = scenario.rosi > 0;

                return (
                  <TableRow
                    key={scenario.id}
                    className={cn(
                      'hover:bg-muted/50 transition-colors',
                      isBest && 'bg-green-50 dark:bg-green-950/20'
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {scenario.name}
                        {isBest && (
                          <Badge variant="default" className="text-xs">
                            Best
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{scenario.controlsCount}</TableCell>
                    <TableCell>{formatCurrency(scenario.totalInvestment)}</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">
                      {formatCurrency(scenario.annualSavings)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-semibold',
                          isPositiveROI
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {scenario.rosi > 0 ? '+' : ''}{scenario.rosi.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatPayback(scenario.paybackMonths)}
                      </span>
                    </TableCell>
                    {onRemoveScenario && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveScenario(scenario.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Average ROSI</p>
            <p className="text-lg font-bold">
              {(scenarios.reduce((sum, s) => sum + s.rosi, 0) / scenarios.length).toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Total Investment Range</p>
            <p className="text-lg font-bold">
              {formatCurrency(Math.min(...scenarios.map(s => s.totalInvestment)))} - {formatCurrency(Math.max(...scenarios.map(s => s.totalInvestment)))}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Best Scenario</p>
            <p className="text-lg font-bold truncate">{bestScenario?.name || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
