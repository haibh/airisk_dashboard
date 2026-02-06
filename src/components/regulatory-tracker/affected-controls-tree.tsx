'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { complianceStatusColors, complianceStatusLabels } from './regulatory-tracker-constants';
import type { FrameworkChange } from './regulatory-tracker-types';

interface AffectedControlsTreeProps {
  frameworkChanges: FrameworkChange[];
}

export function AffectedControlsTree({ frameworkChanges }: AffectedControlsTreeProps) {
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleFramework = (frameworkId: string) => {
    setExpandedFrameworks((prev) => {
      const next = new Set(prev);
      if (next.has(frameworkId)) {
        next.delete(frameworkId);
      } else {
        next.add(frameworkId);
      }
      return next;
    });
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  };

  if (frameworkChanges.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No affected controls to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Affected Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {frameworkChanges.map((framework) => {
            const isFrameworkExpanded = expandedFrameworks.has(framework.frameworkId);

            return (
              <div key={framework.frameworkId} className="border rounded-lg">
                {/* Framework Level */}
                <button
                  onClick={() => toggleFramework(framework.frameworkId)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors"
                >
                  {isFrameworkExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  {isFrameworkExpanded ? (
                    <FolderOpen className="h-4 w-4 flex-shrink-0 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm flex-1 text-left">
                    {framework.frameworkName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {framework.totalControls}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono">
                    {framework.frameworkCode}
                  </Badge>
                </button>

                {/* Categories Level */}
                {isFrameworkExpanded && (
                  <div className="pl-6 pb-2 space-y-1">
                    {framework.categories.map((category) => {
                      const categoryKey = `${framework.frameworkId}-${category.name}`;
                      const isCategoryExpanded = expandedCategories.has(categoryKey);

                      return (
                        <div key={categoryKey} className="border-l-2 border-muted ml-2">
                          {/* Category Level */}
                          <button
                            onClick={() => toggleCategory(categoryKey)}
                            className="w-full flex items-center gap-2 p-2 pl-3 hover:bg-accent transition-colors"
                          >
                            {isCategoryExpanded ? (
                              <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            )}
                            {isCategoryExpanded ? (
                              <FolderOpen className="h-3 w-3 flex-shrink-0 text-primary" />
                            ) : (
                              <Folder className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            )}
                            <span className="text-xs font-medium flex-1 text-left">
                              {category.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {category.controls.length}
                            </Badge>
                          </button>

                          {/* Controls Level */}
                          {isCategoryExpanded && (
                            <div className="pl-6 space-y-1 mt-1">
                              {category.controls.map((control) => (
                                <div
                                  key={control.id}
                                  className="flex items-start gap-2 p-2 rounded hover:bg-accent transition-colors"
                                >
                                  <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-xs font-mono font-medium">
                                        {control.code}
                                      </code>
                                      <Badge
                                        className={cn(
                                          'text-xs border',
                                          complianceStatusColors[control.complianceStatus]
                                        )}
                                      >
                                        {complianceStatusLabels[control.complianceStatus]}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {control.title}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
