/**
 * Framework Controls Table Component
 * Displays controls in a table format with status tracking columns
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileText, CheckCircle2, Circle, AlertCircle, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Compliance status types
type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
type ImplementationStatus = 'implemented' | 'in_progress' | 'planned' | 'not_started';

interface Control {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  children?: Control[];
  // Mock status fields - in production these would come from the database
  complianceStatus?: ComplianceStatus;
  implementationStatus?: ImplementationStatus;
  owner?: string;
  lastReviewed?: string;
  evidenceCount?: number;
}

interface ControlsTableProps {
  controls: Control[];
  showHierarchy?: boolean;
}

// Status badge configurations
const complianceStatusConfig: Record<ComplianceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  compliant: { label: 'Compliant', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
  partial: { label: 'Partial', variant: 'secondary', icon: <AlertCircle className="w-3 h-3" /> },
  non_compliant: { label: 'Non-Compliant', variant: 'destructive', icon: <Circle className="w-3 h-3" /> },
  not_assessed: { label: 'Not Assessed', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
};

const implementationStatusConfig: Record<ImplementationStatus, { label: string; color: string }> = {
  implemented: { label: 'Implemented', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
  planned: { label: 'Planned', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  not_started: { label: 'Not Started', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400' },
};

// Generate mock status for demo purposes
function getMockStatus(code: string): { compliance: ComplianceStatus; implementation: ImplementationStatus } {
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const complianceOptions: ComplianceStatus[] = ['compliant', 'partial', 'non_compliant', 'not_assessed'];
  const implementationOptions: ImplementationStatus[] = ['implemented', 'in_progress', 'planned', 'not_started'];

  return {
    compliance: complianceOptions[hash % complianceOptions.length],
    implementation: implementationOptions[(hash * 3) % implementationOptions.length],
  };
}

// Flatten controls for table display
function flattenControls(controls: Control[], level = 0): (Control & { level: number; hasChildren: boolean })[] {
  const result: (Control & { level: number; hasChildren: boolean })[] = [];

  for (const control of controls) {
    const hasChildren = !!(control.children && control.children.length > 0);
    result.push({ ...control, level, hasChildren });

    if (control.children) {
      result.push(...flattenControls(control.children, level + 1));
    }
  }

  return result;
}

// Recursively filter controls tree by search query
function filterControls(controls: Control[], query: string): Control[] {
  const lowerQuery = query.toLowerCase();
  return controls.reduce<Control[]>((acc, control) => {
    const matchesSelf =
      control.code.toLowerCase().includes(lowerQuery) ||
      control.title.toLowerCase().includes(lowerQuery) ||
      (control.description?.toLowerCase().includes(lowerQuery) ?? false);

    const filteredChildren = control.children
      ? filterControls(control.children, query)
      : [];

    // Include if self matches or any child matches
    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({
        ...control,
        children: filteredChildren.length > 0 ? filteredChildren : control.children,
      });
    }
    return acc;
  }, []);
}

export function FrameworkControlsTable({ controls, showHierarchy = true }: ControlsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter controls based on search query
  const displayControls = useMemo(() => {
    if (!searchQuery.trim()) return controls;
    return filterControls(controls, searchQuery.trim());
  }, [controls, searchQuery]);

  const flatControls = flattenControls(displayControls);

  // Initialize expanded state for top-level items
  useState(() => {
    const topLevelIds = controls.map(c => c.id);
    setExpandedIds(new Set(topLevelIds));
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Check if a control should be visible based on parent expansion
  const isVisible = (control: Control & { level: number }, index: number): boolean => {
    if (control.level === 0) return true;

    // Find parent control
    for (let i = index - 1; i >= 0; i--) {
      const potentialParent = flatControls[i];
      if (potentialParent.level < control.level) {
        if (!effectiveExpandedIds.has(potentialParent.id)) return false;
        if (potentialParent.level === 0) return true;
      }
    }
    return true;
  };

  // When searching, expand all controls to show results
  const effectiveExpandedIds = useMemo(() => {
    if (searchQuery.trim()) {
      const allIds = flatControls.map(c => c.id);
      return new Set(allIds);
    }
    return expandedIds;
  }, [searchQuery, flatControls, expandedIds]);

  if (!controls || controls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No controls found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search controls by code, title, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {displayControls.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          No controls matching &quot;{searchQuery}&quot;
        </div>
      )}

    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead className="min-w-[250px]">Control</TableHead>
            <TableHead className="w-[130px]">Compliance</TableHead>
            <TableHead className="w-[130px]">Implementation</TableHead>
            <TableHead className="w-[100px]">Evidence</TableHead>
            <TableHead className="w-[120px]">Owner</TableHead>
            <TableHead className="w-[100px]">Last Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flatControls.map((control, index) => {
            if (!isVisible(control, index)) return null;

            const mockStatus = getMockStatus(control.code);
            const complianceConfig = complianceStatusConfig[mockStatus.compliance];
            const implementationConfig = implementationStatusConfig[mockStatus.implementation];
            const isLeaf = !control.hasChildren;

            return (
              <TableRow
                key={control.id}
                className={cn(
                  control.level === 0 && 'bg-muted/50 font-medium',
                  control.level === 1 && 'bg-muted/20'
                )}
              >
                <TableCell className="font-mono text-sm">
                  <div
                    className="flex items-center gap-1"
                    style={{ paddingLeft: `${control.level * 12}px` }}
                  >
                    {control.hasChildren ? (
                      <button
                        onClick={() => toggleExpand(control.id)}
                        className="p-0.5 hover:bg-muted rounded"
                      >
                        {effectiveExpandedIds.has(control.id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground/50" />
                    )}
                    <span className={cn(
                      control.level === 0 && 'text-primary font-semibold',
                      control.level > 0 && 'text-muted-foreground'
                    )}>
                      {control.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className={cn(
                      'text-foreground',
                      control.level === 0 && 'font-semibold'
                    )}>
                      {control.title}
                    </div>
                    {isLeaf && control.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {control.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isLeaf && (
                    <Badge variant={complianceConfig.variant} className="gap-1">
                      {complianceConfig.icon}
                      {complianceConfig.label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isLeaf && (
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', implementationConfig.color)}>
                      {implementationConfig.label}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isLeaf && (
                    <span className="text-sm text-muted-foreground">
                      {(control.code.charCodeAt(control.code.length - 1) % 5)} files
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isLeaf && (
                    <span className="text-sm text-muted-foreground">
                      {['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.'][control.code.length % 4]}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isLeaf && (
                    <span className="text-sm text-muted-foreground">
                      {['Jan 15', 'Feb 02', 'Dec 20', 'Nov 30'][control.code.length % 4]}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}
