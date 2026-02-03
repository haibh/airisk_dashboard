'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import {
  AssessmentWithDetails,
  AssessmentListResponse,
} from '@/types/risk-assessment';
import { AssessmentStatus } from '@prisma/client';

export default function RiskAssessmentPage() {
  const t = useTranslations();
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssessments();
  }, [search, statusFilter, page]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
      });

      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/assessments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data: AssessmentListResponse = await response.json();
      setAssessments(data.assessments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    const variants: Record<
      AssessmentStatus,
      { variant: any; label: string }
    > = {
      DRAFT: { variant: 'secondary', label: 'Draft' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      UNDER_REVIEW: { variant: 'outline', label: 'Under Review' },
      APPROVED: { variant: 'default', label: 'Approved' },
      ARCHIVED: { variant: 'destructive', label: 'Archived' },
    };
    return variants[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Risk Assessments</h1>
          <p className="text-gray-600 mt-1">
            Manage AI system risk assessments
          </p>
        </div>
        <Button onClick={() => router.push('/risk-assessment/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assessments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Assessments List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : assessments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No risk assessments found</p>
          <Button onClick={() => router.push('/risk-assessment/new')}>
            Create Your First Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map(assessment => (
            <Card
              key={assessment.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/risk-assessment/${assessment.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {assessment.title}
                    </h3>
                    <Badge
                      variant={getStatusBadge(assessment.status).variant}
                    >
                      {getStatusBadge(assessment.status).label}
                    </Badge>
                  </div>

                  {assessment.description && (
                    <p className="text-gray-600 mb-3">
                      {assessment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">AI System:</span>{' '}
                      {assessment.aiSystem.name}
                    </div>
                    <div>
                      <span className="font-medium">Framework:</span>{' '}
                      {assessment.framework.shortName}
                    </div>
                    <div>
                      <span className="font-medium">Risks:</span>{' '}
                      {assessment._count?.risks || 0}
                    </div>
                    <div>
                      <span className="font-medium">Created by:</span>{' '}
                      {assessment.createdBy.name || assessment.createdBy.email}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Assessment Date:{' '}
                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                    {assessment.nextReviewDate && (
                      <>
                        {' '}
                        | Next Review:{' '}
                        {new Date(
                          assessment.nextReviewDate
                        ).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
