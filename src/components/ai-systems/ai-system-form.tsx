'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AISystemFormData } from '@/types/ai-system';
import { AISystemType, DataClassification, LifecycleStatus, RiskTier } from '@prisma/client';

interface AISystemFormProps {
  initialData?: Partial<AISystemFormData>;
  onSubmit: (data: AISystemFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function AISystemForm({ initialData, onSubmit, onCancel, isEdit = false }: AISystemFormProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AISystemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    systemType: initialData?.systemType || 'ML',
    dataClassification: initialData?.dataClassification || 'INTERNAL',
    lifecycleStatus: initialData?.lifecycleStatus || 'DEVELOPMENT',
    riskTier: initialData?.riskTier || undefined,
    purpose: initialData?.purpose || '',
    dataInputs: initialData?.dataInputs || '',
    dataOutputs: initialData?.dataOutputs || '',
    thirdPartyAPIs: initialData?.thirdPartyAPIs || [],
    baseModels: initialData?.baseModels || [],
    trainingDataSources: initialData?.trainingDataSources || [],
  });

  const [apiInput, setApiInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [dataSourceInput, setDataSourceInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (field: 'thirdPartyAPIs' | 'baseModels' | 'trainingDataSources', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeFromArray = (field: 'thirdPartyAPIs' | 'baseModels' | 'trainingDataSources', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('aiSystems.systemName')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter system name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the AI system"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="systemType">{t('aiSystems.systemType')} *</Label>
              <Select
                value={formData.systemType}
                onValueChange={(value: AISystemType) => setFormData(prev => ({ ...prev, systemType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENAI">{t('aiSystems.types.genai')}</SelectItem>
                  <SelectItem value="ML">{t('aiSystems.types.ml')}</SelectItem>
                  <SelectItem value="RPA">{t('aiSystems.types.rpa')}</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="OTHER">{t('aiSystems.types.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataClassification">{t('aiSystems.dataClassification')} *</Label>
              <Select
                value={formData.dataClassification}
                onValueChange={(value: DataClassification) => setFormData(prev => ({ ...prev, dataClassification: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">{t('aiSystems.classification.public')}</SelectItem>
                  <SelectItem value="INTERNAL">{t('aiSystems.classification.internal')}</SelectItem>
                  <SelectItem value="CONFIDENTIAL">{t('aiSystems.classification.confidential')}</SelectItem>
                  <SelectItem value="RESTRICTED">{t('aiSystems.classification.restricted')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lifecycleStatus">{t('aiSystems.lifecycleStatus')} *</Label>
              <Select
                value={formData.lifecycleStatus}
                onValueChange={(value: LifecycleStatus) => setFormData(prev => ({ ...prev, lifecycleStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEVELOPMENT">{t('aiSystems.lifecycle.development')}</SelectItem>
                  <SelectItem value="PILOT">{t('aiSystems.lifecycle.pilot')}</SelectItem>
                  <SelectItem value="PRODUCTION">{t('aiSystems.lifecycle.production')}</SelectItem>
                  <SelectItem value="DEPRECATED">{t('aiSystems.lifecycle.deprecated')}</SelectItem>
                  <SelectItem value="RETIRED">{t('aiSystems.lifecycle.retired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskTier">{t('aiSystems.riskTier')}</Label>
              <Select
                value={formData.riskTier || 'none'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, riskTier: value === 'none' ? undefined : value as RiskTier }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Assessed</SelectItem>
                  <SelectItem value="HIGH">{t('risk.levels.high')}</SelectItem>
                  <SelectItem value="MEDIUM">{t('risk.levels.medium')}</SelectItem>
                  <SelectItem value="LOW">{t('risk.levels.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What is the purpose of this AI system?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataInputs">Data Inputs</Label>
            <textarea
              id="dataInputs"
              value={formData.dataInputs}
              onChange={(e) => setFormData(prev => ({ ...prev, dataInputs: e.target.value }))}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Describe the input data"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataOutputs">Data Outputs</Label>
            <textarea
              id="dataOutputs"
              value={formData.dataOutputs}
              onChange={(e) => setFormData(prev => ({ ...prev, dataOutputs: e.target.value }))}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Describe the output data"
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Third-Party APIs</Label>
            <div className="flex gap-2">
              <Input
                value={apiInput}
                onChange={(e) => setApiInput(e.target.value)}
                placeholder="e.g., OpenAI API, Google Cloud AI"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('thirdPartyAPIs', apiInput);
                    setApiInput('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addToArray('thirdPartyAPIs', apiInput);
                  setApiInput('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.thirdPartyAPIs.map((api, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {api}
                  <button
                    type="button"
                    onClick={() => removeFromArray('thirdPartyAPIs', index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Base Models</Label>
            <div className="flex gap-2">
              <Input
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="e.g., GPT-4, BERT, ResNet"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('baseModels', modelInput);
                    setModelInput('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addToArray('baseModels', modelInput);
                  setModelInput('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.baseModels.map((model, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {model}
                  <button
                    type="button"
                    onClick={() => removeFromArray('baseModels', index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Training Data Sources</Label>
            <div className="flex gap-2">
              <Input
                value={dataSourceInput}
                onChange={(e) => setDataSourceInput(e.target.value)}
                placeholder="e.g., ImageNet, Internal Database"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('trainingDataSources', dataSourceInput);
                    setDataSourceInput('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addToArray('trainingDataSources', dataSourceInput);
                  setDataSourceInput('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.trainingDataSources.map((source, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {source}
                  <button
                    type="button"
                    onClick={() => removeFromArray('trainingDataSources', index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update System' : 'Create System'}
        </Button>
      </div>
    </form>
  );
}
