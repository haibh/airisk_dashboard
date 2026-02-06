'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { impactLevelColors, impactLevelBg } from './regulatory-tracker-constants';
import type { RegulatoryChangeDetail } from './regulatory-tracker-types';

interface ImpactAssessmentCardProps {
  change: RegulatoryChangeDetail | null;
  onAssessImpact: (changeId: string) => Promise<void>;
  onAcknowledge: (changeId: string) => Promise<void>;
}

export function ImpactAssessmentCard({
  change,
  onAssessImpact,
  onAcknowledge,
}: ImpactAssessmentCardProps) {
  const [isAssessing, setIsAssessing] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  if (!change) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Select a regulatory change to view impact assessment
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAssessImpact = async () => {
    setIsAssessing(true);
    try {
      await onAssessImpact(change.id);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    try {
      await onAcknowledge(change.id);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const getImpactScorePercentage = () => {
    if (!change.impactScore) return 0;
    return Math.min((change.impactScore / 100) * 100, 100);
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{change.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{change.description}</p>
            </div>
            {change.acknowledged && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Acknowledged
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Impact Score Visualization */}
          {change.impactScore !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Impact Score</span>
                <span className={cn('text-lg font-bold', impactLevelColors[change.impactLevel])}>
                  {change.impactScore}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-500', impactLevelBg[change.impactLevel])}
                  style={{ width: `${getImpactScorePercentage()}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className={cn('h-4 w-4', impactLevelColors[change.impactLevel])} />
                <span className="text-xs text-muted-foreground">
                  {change.impactLevel} impact level
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Affected Frameworks */}
          <div>
            <h4 className="text-sm font-medium mb-3">Affected Frameworks</h4>
            {change.affectedFrameworks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {change.affectedFrameworks.map((framework) => (
                  <Badge key={framework.id} variant="outline" className="font-mono text-xs">
                    {framework.code}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No frameworks affected</p>
            )}
          </div>

          <Separator />

          {/* Affected Controls Count */}
          <div>
            <h4 className="text-sm font-medium mb-2">Affected Controls</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">
                  {change.affectedControlsCount}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                controls require review or update
              </span>
            </div>
          </div>

          {/* Recommended Actions */}
          {change.recommendedActions && change.recommendedActions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Recommended Actions</h4>
                <ul className="space-y-2">
                  {change.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleAssessImpact}
              disabled={isAssessing}
              className="w-full"
            >
              {isAssessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assessing Impact...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Assess Impact
                </>
              )}
            </Button>
            {!change.acknowledged && (
              <Button
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                variant="outline"
                className="w-full"
              >
                {isAcknowledging ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Acknowledging...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acknowledge Change
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
