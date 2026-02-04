'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  AlertTriangle,
  Database,
  Folder,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchResult {
  entityType: 'ai_system' | 'assessment' | 'risk' | 'evidence';
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  metadata: Record<string, unknown>;
}

interface SearchResultsPanelProps {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  queryTime: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const entityIcons = {
  ai_system: Database,
  assessment: FileText,
  risk: AlertTriangle,
  evidence: Folder,
};

const entityLabels = {
  ai_system: 'AI Systems',
  assessment: 'Assessments',
  risk: 'Risks',
  evidence: 'Evidence',
};

const entityColors = {
  ai_system: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  assessment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  risk: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  evidence: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export function SearchResultsPanel({
  results,
  total,
  page,
  pageSize,
  queryTime,
  onPageChange,
  isLoading = false,
}: SearchResultsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Group results by entity type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.entityType]) {
      acc[result.entityType] = [];
    }
    acc[result.entityType].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Filter results by active tab
  const filteredResults = activeTab === 'all'
    ? results
    : groupedResults[activeTab] || [];

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    switch (result.entityType) {
      case 'ai_system':
        router.push(`/ai-systems/${result.id}`);
        break;
      case 'assessment':
        router.push(`/risk-assessment/${result.id}`);
        break;
      case 'risk': {
        // Navigate to assessment with risk highlighted
        const assessmentId = result.metadata.assessmentId as string;
        router.push(`/risk-assessment/${assessmentId}?risk=${result.id}`);
        break;
      }
      case 'evidence':
        router.push(`/evidence/${result.id}`);
        break;
    }
  };

  // Format snippet HTML (contains <mark> tags)
  const formatSnippet = (snippet: string) => {
    return { __html: snippet };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Searching...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Search Results ({total.toLocaleString()})
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Found in {queryTime}ms
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({results.length})
            </TabsTrigger>
            {Object.entries(groupedResults).map(([type, items]) => (
              <TabsTrigger key={type} value={type}>
                {entityLabels[type as keyof typeof entityLabels]} ({items.length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredResults.map((result) => {
              const Icon = entityIcons[result.entityType];
              return (
                <div
                  key={`${result.entityType}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${entityColors[result.entityType]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {entityLabels[result.entityType]}
                        </Badge>
                      </div>
                      <p
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={formatSnippet(result.snippet)}
                      />
                      {/* Metadata badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.entityType === 'ai_system' && (
                          <>
                            {result.metadata.systemType && (
                              <Badge variant="secondary" className="text-xs">
                                {result.metadata.systemType as string}
                              </Badge>
                            )}
                            {result.metadata.riskTier && (
                              <Badge
                                variant={
                                  result.metadata.riskTier === 'HIGH'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {result.metadata.riskTier as string} Risk
                              </Badge>
                            )}
                          </>
                        )}
                        {result.entityType === 'assessment' && (
                          <>
                            {result.metadata.status && (
                              <Badge variant="secondary" className="text-xs">
                                {result.metadata.status as string}
                              </Badge>
                            )}
                            {result.metadata.aiSystemName && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.aiSystemName as string}
                              </Badge>
                            )}
                          </>
                        )}
                        {result.entityType === 'risk' && (
                          <>
                            {result.metadata.category && (
                              <Badge variant="secondary" className="text-xs">
                                {result.metadata.category as string}
                              </Badge>
                            )}
                            {result.metadata.residualScore !== undefined && (
                              <Badge
                                variant={
                                  (result.metadata.residualScore as number) >= 15
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                Score: {String(result.metadata.residualScore)}
                              </Badge>
                            )}
                          </>
                        )}
                        {result.entityType === 'evidence' && (
                          <>
                            {result.metadata.reviewStatus && (
                              <Badge variant="secondary" className="text-xs">
                                {result.metadata.reviewStatus as string}
                              </Badge>
                            )}
                            {result.metadata.mimeType && (
                              <Badge variant="outline" className="text-xs">
                                {(result.metadata.mimeType as string).split('/')[1]}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
