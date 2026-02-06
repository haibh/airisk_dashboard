'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, DollarSign, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ROIInputFormProps {
  onSubmit: (values: ROIFormValues) => void;
  initialValues?: Partial<ROIFormValues>;
  isLoading?: boolean;
}

export interface ROIFormValues {
  riskName: string;
  sle: number;
  aro: number;
  mitigationPercent: number;
  implementationCost: number;
  annualMaintenance: number;
}

export function ROIInputForm({ onSubmit, initialValues, isLoading }: ROIInputFormProps) {
  const [values, setValues] = useState<ROIFormValues>({
    riskName: initialValues?.riskName || 'Untitled Risk',
    sle: initialValues?.sle || 0,
    aro: initialValues?.aro || 0,
    mitigationPercent: initialValues?.mitigationPercent || 0,
    implementationCost: initialValues?.implementationCost || 0,
    annualMaintenance: initialValues?.annualMaintenance || 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ROIFormValues, string>>>({});

  const calculatedALE = values.sle * values.aro;
  const calculatedSavings = calculatedALE * (values.mitigationPercent / 100);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ROIFormValues, string>> = {};

    if (values.sle <= 0) newErrors.sle = 'SLE must be greater than 0';
    if (values.aro < 0 || values.aro > 1) newErrors.aro = 'ARO must be between 0 and 1';
    if (values.mitigationPercent < 0 || values.mitigationPercent > 100) {
      newErrors.mitigationPercent = 'Mitigation must be between 0 and 100';
    }
    if (values.implementationCost < 0) newErrors.implementationCost = 'Cost cannot be negative';
    if (values.annualMaintenance < 0) newErrors.annualMaintenance = 'Maintenance cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(values);
    }
  };

  const updateValue = <K extends keyof ROIFormValues>(key: K, value: ROIFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Risk Cost Inputs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Risk Name (Read-only) */}
          <div className="space-y-2">
            <Label>Risk Name</Label>
            <Input value={values.riskName} disabled className="bg-muted" />
          </div>

          {/* SLE */}
          <div className="space-y-2">
            <Label htmlFor="sle">
              Single Loss Expectancy (SLE)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="sle"
                type="number"
                min="0"
                step="1000"
                value={values.sle || ''}
                onChange={(e) => updateValue('sle', parseFloat(e.target.value) || 0)}
                className={cn('pl-9', errors.sle && 'border-destructive')}
                placeholder="100000"
              />
            </div>
            {errors.sle && <p className="text-sm text-destructive">{errors.sle}</p>}
          </div>

          {/* ARO */}
          <div className="space-y-2">
            <Label htmlFor="aro">
              Annualized Rate of Occurrence (ARO)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="aro"
                min={0}
                max={1}
                step={0.01}
                value={[values.aro]}
                onValueChange={(vals: number[]) => updateValue('aro', vals[0])}
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={values.aro}
                onChange={(e) => updateValue('aro', parseFloat(e.target.value) || 0)}
                className={cn('w-20', errors.aro && 'border-destructive')}
              />
            </div>
            {errors.aro && <p className="text-sm text-destructive">{errors.aro}</p>}
          </div>

          {/* ALE (Calculated) */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-semibold">Annual Loss Expectancy (ALE)</Label>
            <p className="text-2xl font-bold">${calculatedALE.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">SLE × ARO</p>
          </div>

          {/* Mitigation Percent */}
          <div className="space-y-2">
            <Label htmlFor="mitigation">
              Expected Risk Mitigation
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="mitigation"
                min={0}
                max={100}
                step={1}
                value={[values.mitigationPercent]}
                onValueChange={(vals: number[]) => updateValue('mitigationPercent', vals[0])}
                className="flex-1"
              />
              <div className="relative w-20">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={values.mitigationPercent}
                  onChange={(e) => updateValue('mitigationPercent', parseFloat(e.target.value) || 0)}
                  className={cn(errors.mitigationPercent && 'border-destructive')}
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {errors.mitigationPercent && <p className="text-sm text-destructive">{errors.mitigationPercent}</p>}
          </div>

          {/* Implementation Cost */}
          <div className="space-y-2">
            <Label htmlFor="implCost">
              Implementation Cost
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="implCost"
                type="number"
                min="0"
                step="1000"
                value={values.implementationCost || ''}
                onChange={(e) => updateValue('implementationCost', parseFloat(e.target.value) || 0)}
                className={cn('pl-9', errors.implementationCost && 'border-destructive')}
                placeholder="50000"
              />
            </div>
            {errors.implementationCost && <p className="text-sm text-destructive">{errors.implementationCost}</p>}
          </div>

          {/* Annual Maintenance */}
          <div className="space-y-2">
            <Label htmlFor="maintenance">Annual Maintenance Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="maintenance"
                type="number"
                min="0"
                step="1000"
                value={values.annualMaintenance || ''}
                onChange={(e) => updateValue('annualMaintenance', parseFloat(e.target.value) || 0)}
                className={cn('pl-9', errors.annualMaintenance && 'border-destructive')}
                placeholder="10000"
              />
            </div>
            {errors.annualMaintenance && <p className="text-sm text-destructive">{errors.annualMaintenance}</p>}
          </div>

          {/* Annual Savings (Calculated) */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-semibold">Expected Annual Savings</Label>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500">
              ${calculatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">ALE × Mitigation %</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Calculating...' : 'Calculate ROSI'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
