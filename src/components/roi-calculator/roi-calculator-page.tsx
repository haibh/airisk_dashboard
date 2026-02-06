'use client';

import { useState, useEffect } from 'react';
import { ROIInputForm, ROIFormValues } from './roi-input-form';
import { ROSIResultCard, ROSIResult } from './rosi-result-card';
import { PaybackPeriodChart } from './payback-period-chart';
import { ScenarioComparisonTable, ScenarioResult } from './scenario-comparison-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calculator, Plus } from 'lucide-react';

interface CostProfile {
  id: string;
  riskId: string;
  riskName: string;
  sle: number;
  aro: number;
  ale: number;
}

export function ROICalculatorPage() {
  const [costProfiles, setCostProfiles] = useState<CostProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CostProfile | null>(null);
  const [result, setResult] = useState<ROSIResult | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Fetch cost profiles on mount
  useEffect(() => {
    fetchCostProfiles();
  }, []);

  const fetchCostProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      const response = await fetch('/api/roi/cost-profiles');

      if (!response.ok) {
        throw new Error('Failed to fetch cost profiles');
      }

      const data = await response.json();
      setCostProfiles(data.profiles || []);

      // Auto-select first profile if available
      if (data.profiles && data.profiles.length > 0) {
        setSelectedProfile(data.profiles[0]);
      }
    } catch (error) {
      toast.error('Failed to load cost profiles. Please try again.');
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleCalculateROSI = async (values: ROIFormValues) => {
    try {
      setIsLoading(true);

      // Calculate ROSI using the API
      const response = await fetch('/api/roi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: selectedProfile?.id || 'default',
          sle: values.sle,
          aro: values.aro,
          mitigationPercent: values.mitigationPercent,
          implementationCost: values.implementationCost,
          annualMaintenance: values.annualMaintenance,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROSI');
      }

      const data = await response.json();

      // Transform API response to match ROSIResult interface
      const calculatedResult: ROSIResult = {
        rosi: data.rosi || 0,
        totalALE: data.totalALE || values.sle * values.aro,
        totalInvestment: data.totalInvestment || values.implementationCost + values.annualMaintenance,
        annualSavings: data.annualSavings || (values.sle * values.aro * values.mitigationPercent) / 100,
        netBenefit: data.netBenefit || 0,
        paybackPeriodMonths: data.paybackPeriodMonths || 0,
      };

      setResult(calculatedResult);

      toast.success(`ROSI Calculated: ${calculatedResult.rosi.toFixed(1)}%`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to calculate ROSI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScenario = () => {
    if (!result) {
      toast.error('Calculate ROSI first before adding scenarios');
      return;
    }

    const newScenario: ScenarioResult = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
      controlsCount: Math.floor(Math.random() * 10) + 1, // Placeholder
      totalInvestment: result.totalInvestment,
      annualSavings: result.annualSavings,
      rosi: result.rosi,
      paybackMonths: result.paybackPeriodMonths,
    };

    setScenarios([...scenarios, newScenario]);

    toast.success(`${newScenario.name} added to comparison`);
  };

  const handleRemoveScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
    toast.success('Scenario removed from comparison');
  };

  const initialFormValues: Partial<ROIFormValues> = selectedProfile
    ? {
        riskName: selectedProfile.riskName,
        sle: selectedProfile.sle,
        aro: selectedProfile.aro,
        mitigationPercent: 70,
        implementationCost: 50000,
        annualMaintenance: 10000,
      }
    : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            ROI Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Quantify the financial value of risk mitigation investments
          </p>
        </div>
        {result && (
          <Button onClick={handleAddScenario} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add to Scenarios
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      {isLoadingProfiles ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading cost profiles...</p>
        </div>
      ) : (
        <>
          {/* Input Form and Result Card Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ROIInputForm
              onSubmit={handleCalculateROSI}
              initialValues={initialFormValues}
              isLoading={isLoading}
            />
            {result && <ROSIResultCard result={result} />}
          </div>

          {/* Payback Period Chart */}
          {result && (
            <PaybackPeriodChart
              implementationCost={result.totalInvestment}
              annualMaintenance={0} // Already included in total investment
              annualSavings={result.annualSavings}
            />
          )}

          {/* Scenario Comparison Table */}
          <ScenarioComparisonTable
            scenarios={scenarios}
            onAddScenario={handleAddScenario}
            onRemoveScenario={handleRemoveScenario}
          />
        </>
      )}
    </div>
  );
}
