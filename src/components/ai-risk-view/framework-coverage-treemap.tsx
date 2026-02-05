'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { ComplianceFramework } from '@/types/dashboard';

// Color scheme with better contrast for readability
const TREEMAP_COLORS = [
  'hsl(142, 71%, 45%)',   // Green - high compliance (80%+)
  'hsl(48, 96%, 45%)',    // Yellow - good compliance (60-79%)
  'hsl(25, 95%, 50%)',    // Orange - medium compliance (40-59%)
  'hsl(0, 72%, 55%)',     // Red - low compliance (<40%) - lighter for better text contrast
];

function getColorByCompliance(percentage: number): string {
  if (percentage >= 80) return TREEMAP_COLORS[0];
  if (percentage >= 60) return TREEMAP_COLORS[1];
  if (percentage >= 40) return TREEMAP_COLORS[2];
  return TREEMAP_COLORS[3];
}

// Custom tooltip component for better visibility
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; percentage: number; size: number } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg px-3 py-2">
      <p className="font-medium text-sm">{data.name}</p>
      <p className="text-xs text-muted-foreground">{data.percentage}% compliance</p>
      <p className="text-xs text-muted-foreground">{data.size} controls</p>
    </div>
  );
}

interface FrameworkCoverageTreemapProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

/* Custom content renderer for Treemap cells */
function TreemapCell(props: { x: number; y: number; width: number; height: number; name: string; percentage: number }) {
  const { x, y, width, height, name, percentage } = props;
  if (width < 30 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={getColorByCompliance(percentage)}
        fillOpacity={0.85}
        stroke="hsl(var(--background))"
        strokeWidth={2}
      />
      {width > 60 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={10} opacity={0.9}>
            {percentage}%
          </text>
        </>
      )}
    </g>
  );
}

export function FrameworkCoverageTreemap({ frameworks, isLoading }: FrameworkCoverageTreemapProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (frameworks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Framework Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No framework data</p>
        </CardContent>
      </Card>
    );
  }

  const treeData = frameworks.map((fw) => ({
    name: fw.framework,
    size: fw.totalControls || 1,
    percentage: fw.percentage,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Framework Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="size"
              stroke="hsl(var(--background))"
              content={<TreemapCell x={0} y={0} width={0} height={0} name="" percentage={0} />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
