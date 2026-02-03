'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiskFormData } from '@/types/risk-assessment';
import { RiskCategory, TreatmentStatus } from '@prisma/client';
import { calculateInherentScore, getRiskLevel } from '@/lib/risk-scoring-calculator';

interface RiskEntryFormProps {
  initialData?: Partial<RiskFormData>;
  onSubmit: (data: RiskFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function RiskEntryForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: RiskEntryFormProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RiskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'OTHER',
    likelihood: initialData?.likelihood || 3,
    impact: initialData?.impact || 3,
    treatmentPlan: initialData?.treatmentPlan || '',
    treatmentDueDate: initialData?.treatmentDueDate || undefined,
  });

  const inherentScore = calculateInherentScore(
    formData.likelihood,
    formData.impact
  );
  const riskLevel = getRiskLevel(inherentScore);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Risk Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Bias in training data"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Detailed description of the risk..."
          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Risk Category *</Label>
        <Select
          value={formData.category}
          onValueChange={value =>
            setFormData({ ...formData, category: value as RiskCategory })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BIAS_FAIRNESS">Bias & Fairness</SelectItem>
            <SelectItem value="PRIVACY">Privacy</SelectItem>
            <SelectItem value="SECURITY">Security</SelectItem>
            <SelectItem value="RELIABILITY">Reliability</SelectItem>
            <SelectItem value="TRANSPARENCY">Transparency</SelectItem>
            <SelectItem value="ACCOUNTABILITY">Accountability</SelectItem>
            <SelectItem value="SAFETY">Safety</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Likelihood Slider */}
      <div>
        <Label htmlFor="likelihood">
          Likelihood: {formData.likelihood} - {getLikelihoodLabel(formData.likelihood)}
        </Label>
        <input
          type="range"
          id="likelihood"
          min="1"
          max="5"
          step="1"
          value={formData.likelihood}
          onChange={e =>
            setFormData({
              ...formData,
              likelihood: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 - Rare</span>
          <span>3 - Possible</span>
          <span>5 - Almost Certain</span>
        </div>
      </div>

      {/* Impact Slider */}
      <div>
        <Label htmlFor="impact">
          Impact: {formData.impact} - {getImpactLabel(formData.impact)}
        </Label>
        <input
          type="range"
          id="impact"
          min="1"
          max="5"
          step="1"
          value={formData.impact}
          onChange={e =>
            setFormData({
              ...formData,
              impact: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 - Insignificant</span>
          <span>3 - Moderate</span>
          <span>5 - Catastrophic</span>
        </div>
      </div>

      {/* Calculated Score */}
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-medium">Inherent Risk Score:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{inherentScore}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                riskLevel === 'CRITICAL'
                  ? 'bg-red-100 text-red-800'
                  : riskLevel === 'HIGH'
                  ? 'bg-orange-100 text-orange-800'
                  : riskLevel === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Treatment Plan */}
      <div>
        <Label htmlFor="treatmentPlan">Treatment Plan</Label>
        <textarea
          id="treatmentPlan"
          value={formData.treatmentPlan}
          onChange={e =>
            setFormData({ ...formData, treatmentPlan: e.target.value })
          }
          placeholder="Mitigation strategy and action plan..."
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Treatment Due Date */}
      <div>
        <Label htmlFor="treatmentDueDate">Treatment Due Date</Label>
        <Input
          type="date"
          id="treatmentDueDate"
          value={
            formData.treatmentDueDate
              ? new Date(formData.treatmentDueDate).toISOString().split('T')[0]
              : ''
          }
          onChange={e =>
            setFormData({
              ...formData,
              treatmentDueDate: e.target.value
                ? new Date(e.target.value)
                : undefined,
            })
          }
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Risk' : 'Add Risk'}
        </Button>
      </div>
    </form>
  );
}

function getLikelihoodLabel(value: number): string {
  const labels = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  return labels[value] || '';
}

function getImpactLabel(value: number): string {
  const labels = ['', 'Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  return labels[value] || '';
}
