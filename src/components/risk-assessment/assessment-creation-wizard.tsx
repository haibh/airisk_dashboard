'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
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
  const t = useTranslations('risk');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);

  const [assessmentData, setAssessmentData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    aiSystemId: '',
    frameworkId: '',
    assessmentDate: new Date(),
    nextReviewDate: new Date(),
  });

  const [risks, setRisks] = useState<RiskFormData[]>([]);
  const [showRiskForm, setShowRiskForm] = useState(false);

  const steps = [
    { number: 1, title: t('steps.basicInfo') },
    { number: 2, title: t('steps.selectAiSystem') },
    { number: 3, title: t('steps.selectFramework') },
    { number: 4, title: t('steps.addRisks') },
    { number: 5, title: t('steps.reviewSubmit') },
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
      // Serialize dates to ISO strings for API validation
      const payload = {
        title: assessmentData.title,
        description: assessmentData.description || null,
        aiSystemId: assessmentData.aiSystemId,
        frameworkId: assessmentData.frameworkId,
        assessmentDate: assessmentData.assessmentDate
          ? new Date(assessmentData.assessmentDate).toISOString()
          : new Date().toISOString(),
        nextReviewDate: assessmentData.nextReviewDate
          ? new Date(assessmentData.nextReviewDate).toISOString()
          : null,
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assessment');
      }

      const assessment = await response.json();

      // Add risks if any
      for (const risk of risks) {
        const riskPayload = {
          ...risk,
          treatmentDueDate: risk.treatmentDueDate
            ? new Date(risk.treatmentDueDate).toISOString()
            : null,
        };
        await fetch(`/api/assessments/${assessment.id}/risks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(riskPayload),
        });
      }

      router.push(`/risk-assessment/${assessment.id}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8 pb-6">
        <div className="flex items-start">
          {steps.map(step => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div
                key={step.number}
                className={`flex flex-col items-center ${step.number !== steps.length ? 'flex-1' : ''}`}
              >
                <div className="flex items-center w-full">
                  {step.number !== 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        currentStep >= step.number ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs text-center whitespace-nowrap ${
                      isCurrent
                        ? 'text-primary font-semibold'
                        : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {step.number !== steps.length && (
                    <div
                      className={`flex-1 h-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
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
                <Label htmlFor="title">{t('form.assessmentTitle')} *</Label>
                <Input
                  id="title"
                  value={assessmentData.title}
                  onChange={e =>
                    setAssessmentData({
                      ...assessmentData,
                      title: e.target.value,
                    })
                  }
                  placeholder={t('form.assessmentTitlePlaceholder')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">{t('form.description')}</Label>
                <textarea
                  id="description"
                  value={assessmentData.description}
                  onChange={e =>
                    setAssessmentData({
                      ...assessmentData,
                      description: e.target.value,
                    })
                  }
                  placeholder={t('form.descriptionPlaceholder')}
                  className="flex w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="nextReviewDate">{t('form.nextReviewDate')}</Label>
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
                <div className="p-4 bg-muted rounded-md">
                  {(() => {
                    const selected = aiSystems.find(
                      s => s.id === assessmentData.aiSystemId
                    );
                    return selected ? (
                      <>
                        <h4 className="font-medium mb-2 text-foreground">{selected.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selected.description || 'No description'}
                        </p>
                        <div className="mt-2 text-sm text-foreground">
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
                <div className="p-4 bg-muted rounded-md">
                  {(() => {
                    const selected = frameworks.find(
                      f => f.id === assessmentData.frameworkId
                    );
                    return selected ? (
                      <>
                        <h4 className="font-medium mb-2 text-foreground">{selected.name}</h4>
                        <p className="text-sm text-muted-foreground">
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
                          className="p-3 border border-border rounded-md flex justify-between items-start"
                        >
                          <div>
                            <h4 className="font-medium text-foreground">{risk.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Category: {risk.category} | L: {risk.likelihood} |
                              I: {risk.impact}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRisk(index)}
                          >
                            {tCommon('delete')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {risks.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
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
                <h3 className="font-semibold mb-2 text-foreground">Assessment Details</h3>
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <div className="text-foreground">
                    <span className="font-medium">Title:</span>{' '}
                    {assessmentData.title}
                  </div>
                  <div className="text-foreground">
                    <span className="font-medium">AI System:</span>{' '}
                    {
                      aiSystems.find(s => s.id === assessmentData.aiSystemId)
                        ?.name
                    }
                  </div>
                  <div className="text-foreground">
                    <span className="font-medium">Framework:</span>{' '}
                    {
                      frameworks.find(f => f.id === assessmentData.frameworkId)
                        ?.name
                    }
                  </div>
                  <div className="text-foreground">
                    <span className="font-medium">Total Risks:</span>{' '}
                    {risks.length}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">Risks Summary</h3>
                <div className="space-y-2">
                  {risks.map((risk, index) => (
                    <div key={index} className="p-3 border border-border rounded-md">
                      <div className="font-medium text-foreground">{risk.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
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
                {tCommon('back')}
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
                  {tCommon('next')}
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? tCommon('loading') : tCommon('submit')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
