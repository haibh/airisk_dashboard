/**
 * Gap List Table Component
 * Table showing all identified compliance gaps with filtering and sorting
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Download, Search } from 'lucide-react';

interface FrameworkGap {
  controlId: string;
  controlCode: string;
  controlTitle: string;
  frameworkId: string;
  frameworkName: string;
  hasAssessment: boolean;
  hasEvidence: boolean;
  complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_ASSESSED';
  mappedControls: Array<{
    controlId: string;
    controlCode: string;
    frameworkId: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

interface GapListTableProps {
  gaps: FrameworkGap[];
  frameworks: Array<{ id: string; name: string; shortName: string }>;
  onExport: () => void;
}

type SortField = 'controlCode' | 'frameworkName' | 'complianceStatus';
type SortDirection = 'asc' | 'desc';

export function GapListTable({ gaps, frameworks, onExport }: GapListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('complianceStatus');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort gaps
  const filteredGaps = useMemo(() => {
    let result = [...gaps];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (gap) =>
          gap.controlCode.toLowerCase().includes(query) ||
          gap.controlTitle.toLowerCase().includes(query) ||
          gap.frameworkName.toLowerCase().includes(query)
      );
    }

    // Framework filter
    if (filterFramework !== 'all') {
      result = result.filter((gap) => gap.frameworkId === filterFramework);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((gap) => gap.complianceStatus === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'controlCode':
          comparison = a.controlCode.localeCompare(b.controlCode);
          break;
        case 'frameworkName':
          comparison = a.frameworkName.localeCompare(b.frameworkName);
          break;
        case 'complianceStatus': {
          const statusOrder = { NOT_ASSESSED: 0, NON_COMPLIANT: 1, PARTIAL: 2, COMPLIANT: 3 };
          comparison = statusOrder[a.complianceStatus] - statusOrder[b.complianceStatus];
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [gaps, searchQuery, filterFramework, filterStatus, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: FrameworkGap['complianceStatus']) => {
    const variants: Record<typeof status, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      COMPLIANT: { variant: 'default', label: 'Compliant' },
      PARTIAL: { variant: 'secondary', label: 'Partial' },
      NON_COMPLIANT: { variant: 'destructive', label: 'Non-Compliant' },
      NOT_ASSESSED: { variant: 'outline', label: 'Not Assessed' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No gaps identified</p>
        <p className="text-sm">All controls are fully compliant</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterFramework} onValueChange={setFilterFramework}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by framework" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frameworks</SelectItem>
            {frameworks.map((fw) => (
              <SelectItem key={fw.id} value={fw.id}>
                {fw.shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="NOT_ASSESSED">Not Assessed</SelectItem>
            <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredGaps.length} of {gaps.length} gaps
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('controlCode')}
                  className="h-8 gap-1"
                >
                  Control
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('frameworkName')}
                  className="h-8 gap-1"
                >
                  Framework
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('complianceStatus')}
                  className="h-8 gap-1"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Mapped Controls</TableHead>
              <TableHead>Evidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGaps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No gaps match your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredGaps.map((gap) => (
                <TableRow key={`${gap.frameworkId}-${gap.controlId}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{gap.controlCode}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {gap.controlTitle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{gap.frameworkName}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(gap.complianceStatus)}</TableCell>
                  <TableCell>
                    {gap.mappedControls.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {gap.mappedControls.slice(0, 3).map((mc) => (
                          <Badge key={mc.controlId} variant="outline" className="text-xs">
                            {mc.controlCode}
                          </Badge>
                        ))}
                        {gap.mappedControls.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{gap.mappedControls.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {gap.hasEvidence ? (
                        <Badge variant="default" className="text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
