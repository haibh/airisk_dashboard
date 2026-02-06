'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Layers, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ComplianceFramework } from '@/types/dashboard';

interface FrameworkDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  framework: ComplianceFramework | null;
}

/** Category badge styling per framework category */
function getCategoryStyle(shortName: string): { label: string; className: string } {
  const sn = shortName.toUpperCase();
  if (sn.includes('NIST-AI') || sn.includes('OWASP') || sn.includes('MITRE') || sn.includes('GOOGLE'))
    return { label: 'AI Risk', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' };
  if (sn.includes('ISO-42001') || sn.includes('MS-RAI') || sn.includes('OECD') || sn.includes('SG-AI'))
    return { label: 'AI Management', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' };
  if (sn.includes('CSA'))
    return { label: 'AI Control', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' };
  if (sn.includes('EU-AI') || sn.includes('NIS2') || sn.includes('DORA') || sn.includes('CMMC') || sn.includes('HIPAA') || sn.includes('PCI') || sn.includes('SOC'))
    return { label: 'Compliance', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' };
  return { label: 'Security', className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200' };
}

/** Traffic-light color for compliance percentage */
function getComplianceColor(pct: number): string {
  if (pct >= 80) return 'text-green-600 dark:text-green-400';
  if (pct >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getProgressColor(pct: number): string {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getEffectivenessColor(eff: number): string {
  if (eff >= 80) return 'text-green-600 dark:text-green-400';
  if (eff >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function FrameworkDrilldownModal({
  open,
  onOpenChange,
  framework,
}: FrameworkDrilldownModalProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  if (!framework) return null;

  const category = getCategoryStyle(framework.framework);
  const unmappedControls = framework.totalControls - framework.mappedControls;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg !bg-white dark:!bg-slate-900 border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {framework.framework}
          </DialogTitle>
          <DialogDescription>{framework.frameworkName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category + compliance badge row */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${category.className}`}>
              {category.label}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getComplianceColor(framework.percentage)}`}>
              {framework.percentage}% compliant
            </Badge>
          </div>

          {/* Compliance progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Compliance Progress</span>
              <span className={`font-semibold ${getComplianceColor(framework.percentage)}`}>
                {framework.percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(framework.percentage)} transition-all duration-500`}
                style={{ width: `${framework.percentage}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border rounded-lg p-3 text-center">
              <Layers className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold text-foreground">{framework.totalControls}</div>
              <div className="text-[10px] text-muted-foreground">Total Controls</div>
            </div>
            <div className="border border-border rounded-lg p-3 text-center">
              <Shield className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <div className="text-lg font-bold text-foreground">{framework.mappedControls}</div>
              <div className="text-[10px] text-muted-foreground">Mapped</div>
            </div>
            <div className="border border-border rounded-lg p-3 text-center">
              <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className={`text-lg font-bold ${getEffectivenessColor(framework.avgEffectiveness)}`}>
                {framework.avgEffectiveness}%
              </div>
              <div className="text-[10px] text-muted-foreground">Avg Effectiveness</div>
            </div>
          </div>

          {/* Unmapped controls notice */}
          {unmappedControls > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 flex items-center gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{unmappedControls}</span>
              controls are not yet mapped to any risk assessment
            </div>
          )}

          {/* Link to framework detail page */}
          <Link
            href={`/${locale}/frameworks/${framework.frameworkId}`}
            onClick={() => onOpenChange(false)}
          >
            <Button variant="outline" className="w-full gap-2 cursor-pointer">
              View Full Framework & Controls
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
