'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssessmentFormData, RiskFormData } from '@/types/risk-assessment';
import { RiskEntryForm } from './risk-entry-form';
import { AISystemWithOwner } from '@/types/ai-system';

interface AssessmentCreationWizardProps {
  aiSystems: AISystemWithOwner[];
  frameworks: any[];
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

export function AssessmentCreationWizard({
  aiSystems,
  frameworks,
}: AssessmentCreationWizardProps) {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);

  const [assessmentData, setAssessmentData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    aiSystemId: '',
    frameworkId: '',
    assessmentDate: new Date(),
    nextReviewDate: undefined,
  });

  const [risks, setRisks] = useState<RiskFormData[]>([]);
  const [showRiskForm, setShowRiskForm] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Select AI System' },
    { number: 3, title: 'Select Framework' },
    { number: 4, title: 'Add Risks' },
    { number: 5, title: 'Review & Submit' },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleAddRisk = async (risk: RiskFormData) => {
    setRisks([...risks, risk]);
    setShowRiskForm(false);
  };

  const handleRemoveRisk = (index: number) => {
    setRisks(risks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create assessment
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) throw new Error('Failed to create assessment');

      const assessment = await response.json();

      // Add risks
      for (const risk of risks) {
        await fetch(`/api/assessments/${assessment.id}/risks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(risk),
        });
      }

      router.push(`/risk-assessment/${assessment.id}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map(step => (
            <div
              key={step.number}
              className={`flex-1 ${step.number !== steps.length ? 'pr-4' : ''}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.number}
                </div>
                {step.number !== steps.length && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <div className="mt-2 text-xs text-center">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={assessmentData.title}
                  onChange={e =>
                    setAssessmentData({
                      ...assessmentData,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Q1 2026 AI Risk Assessment"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={assessmentData.description}
                  onChange={e =>
                    setAssessmentData({
                      ...assessmentData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Purpose and scope of this assessment..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="nextReviewDate">Next Review Date</Label>
                <Input
                  type="date"
                  id="nextReviewDate"
                  value={
                    assessmentData.nextReviewDate
                      ? new Date(assessmentData.nextReviewDate)
                          .toISOString()
                          .split('T')[0]
                      : ''
                  }
                  onChange={e =>
                    setAssessmentData({
                      ...assessmentData,
                      nextReviewDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Select AI System */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Select AI System *</Label>
                <Select
                  value={assessmentData.aiSystemId}
                  onValueChange={value =>
                    setAssessmentData({
                      ...assessmentData,
                      aiSystemId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AI system..." />
                  </SelectTrigger>
                  <SelectContent>
                    {aiSystems.map(system => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.name} ({system.systemType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {assessmentData.aiSystemId && (
                <div className="p-4 bg-gray-50 rounded-md">
                  {(() => {
                    const selected = aiSystems.find(
                      s => s.id === assessmentData.aiSystemId
                    );
                    return selected ? (
                      <>
                        <h4 className="font-medium mb-2">{selected.name}</h4>
                        <p className="text-sm text-gray-600">
                          {selected.description || 'No description'}
                        </p>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Type:</span>{' '}
                          {selected.systemType}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Framework */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Select Framework *</Label>
                <Select
                  value={assessmentData.frameworkId}
                  onValueChange={value =>
                    setAssessmentData({
                      ...assessmentData,
                      frameworkId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a framework..." />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.name} ({framework.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {assessmentData.frameworkId && (
                <div className="p-4 bg-gray-50 rounded-md">
                  {(() => {
                    const selected = frameworks.find(
                      f => f.id === assessmentData.frameworkId
                    );
                    return selected ? (
                      <>
                        <h4 className="font-medium mb-2">{selected.name}</h4>
                        <p className="text-sm text-gray-600">
                          {selected.description || 'No description'}
                        </p>
                      </>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Add Risks */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {!showRiskForm ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      Risks Added: {risks.length}
                    </h3>
                    <Button onClick={() => setShowRiskForm(true)}>
                      Add Risk
                    </Button>
                  </div>

                  {risks.length > 0 && (
                    <div className="space-y-2">
                      {risks.map((risk, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-md flex justify-between items-start"
                        >
                          <div>
                            <h4 className="font-medium">{risk.title}</h4>
                            <p className="text-sm text-gray-600">
                              Category: {risk.category} | L: {risk.likelihood} |
                              I: {risk.impact}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRisk(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {risks.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No risks added yet. Click "Add Risk" to begin.
                    </p>
                  )}
                </>
              ) : (
                <RiskEntryForm
                  onSubmit={handleAddRisk}
                  onCancel={() => setShowRiskForm(false)}
                />
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Assessment Details</h3>
                <div className="p-4 bg-gray-50 rounded-md space-y-2">
                  <div>
                    <span className="font-medium">Title:</span>{' '}
                    {assessmentData.title}
                  </div>
                  <div>
                    <span className="font-medium">AI System:</span>{' '}
                    {
                      aiSystems.find(s => s.id === assessmentData.aiSystemId)
                        ?.name
                    }
                  </div>
                  <div>
                    <span className="font-medium">Framework:</span>{' '}
                    {
                      frameworks.find(f => f.id === assessmentData.frameworkId)
                        ?.name
                    }
                  </div>
                  <div>
                    <span className="font-medium">Total Risks:</span>{' '}
                    {risks.length}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Risks Summary</h3>
                <div className="space-y-2">
                  {risks.map((risk, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {risk.category} | Likelihood: {risk.likelihood} | Impact:{' '}
                        {risk.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {!showRiskForm && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !assessmentData.title) ||
                    (currentStep === 2 && !assessmentData.aiSystemId) ||
                    (currentStep === 3 && !assessmentData.frameworkId)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Assessment'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
