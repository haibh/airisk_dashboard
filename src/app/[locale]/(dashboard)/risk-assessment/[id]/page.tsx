'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiskMatrixVisualization } from '@/components/risk-assessment/risk-matrix-visualization';
import { AssessmentWithDetails } from '@/types/risk-assessment';
import { AssessmentStatus, RiskCategory, TreatmentStatus } from '@prisma/client';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import { getRiskLevel, getRiskLevelColor } from '@/lib/risk-scoring-calculator';

export default function AssessmentDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params?.id as string;

  const [assessment, setAssessment] = useState<AssessmentWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: AssessmentStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');

      await fetchAssessment();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
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

  const getCategoryLabel = (category: RiskCategory) => {
    return category.replace(/_/g, ' ');
  };

  const getTreatmentBadge = (status: TreatmentStatus) => {
    const variants: Record<TreatmentStatus, { variant: any; label: string }> =
      {
        PENDING: { variant: 'secondary', label: 'Pending' },
        ACCEPTED: { variant: 'outline', label: 'Accepted' },
        MITIGATING: { variant: 'default', label: 'Mitigating' },
        TRANSFERRED: { variant: 'outline', label: 'Transferred' },
        AVOIDED: { variant: 'outline', label: 'Avoided' },
        COMPLETED: { variant: 'default', label: 'Completed' },
      };
    return variants[status];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Assessment not found</p>
        <Button onClick={() => router.push('/risk-assessment')}>
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/risk-assessment')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{assessment.title}</h1>
              <Badge variant={getStatusBadge(assessment.status).variant}>
                {getStatusBadge(assessment.status).label}
              </Badge>
            </div>
            {assessment.description && (
              <p className="text-gray-600 mt-2">{assessment.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/risk-assessment/${assessmentId}/edit`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{assessment.aiSystem.name}</div>
            <div className="text-sm text-gray-500">
              {assessment.aiSystem.systemType}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{assessment.framework.name}</div>
            <div className="text-sm text-gray-500">
              {assessment.framework.shortName}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessment.risks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Workflow */}
      {assessment.status !== 'ARCHIVED' && (
        <Card>
          <CardHeader>
            <CardTitle>Status Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {assessment.status === 'DRAFT' && (
                <Button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={updating}
                >
                  Start Assessment
                </Button>
              )}
              {assessment.status === 'IN_PROGRESS' && (
                <Button
                  onClick={() => handleStatusChange('UNDER_REVIEW')}
                  disabled={updating}
                >
                  Submit for Review
                </Button>
              )}
              {assessment.status === 'UNDER_REVIEW' && (
                <>
                  <Button
                    onClick={() => handleStatusChange('APPROVED')}
                    disabled={updating}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={updating}
                  >
                    Request Changes
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Matrix */}
      {assessment.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskMatrixVisualization risks={assessment.risks} />
          </CardContent>
        </Card>
      )}

      {/* Risk Register */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Risk Register</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assessment.risks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No risks added yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Risk</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-center py-3 px-4">L</th>
                    <th className="text-center py-3 px-4">I</th>
                    <th className="text-center py-3 px-4">Inherent</th>
                    <th className="text-center py-3 px-4">Residual</th>
                    <th className="text-left py-3 px-4">Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  {assessment.risks.map(risk => {
                    const inherentLevel = getRiskLevel(risk.inherentScore);
                    const residualLevel = getRiskLevel(risk.residualScore);
                    return (
                      <tr key={risk.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{risk.title}</div>
                          {risk.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {risk.description.substring(0, 100)}
                              {risk.description.length > 100 && '...'}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {getCategoryLabel(risk.category)}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          {risk.likelihood}
                        </td>
                        <td className="text-center py-3 px-4">
                          {risk.impact}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${getRiskLevelColor(
                              inherentLevel
                            )}`}
                          >
                            {risk.inherentScore}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${getRiskLevelColor(
                              residualLevel
                            )}`}
                          >
                            {risk.residualScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              getTreatmentBadge(risk.treatmentStatus).variant
                            }
                          >
                            {getTreatmentBadge(risk.treatmentStatus).label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Created by:</span>{' '}
            {assessment.createdBy.name || assessment.createdBy.email}
          </div>
          <div>
            <span className="font-medium">Assessment Date:</span>{' '}
            {new Date(assessment.assessmentDate).toLocaleDateString()}
          </div>
          {assessment.nextReviewDate && (
            <div>
              <span className="font-medium">Next Review Date:</span>{' '}
              {new Date(assessment.nextReviewDate).toLocaleDateString()}
            </div>
          )}
          {assessment.completedAt && (
            <div>
              <span className="font-medium">Completed:</span>{' '}
              {new Date(assessment.completedAt).toLocaleDateString()}
            </div>
          )}
          <div>
            <span className="font-medium">Last Updated:</span>{' '}
            {new Date(assessment.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
