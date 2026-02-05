'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings2, Scale, AlertTriangle } from 'lucide-react';

interface ScoringConfig {
  compliantThreshold: number;
  partialThreshold: number;
  priorityWeights: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

interface Framework {
  id: string;
  name: string;
  shortName: string;
  scoringConfig: ScoringConfig | null;
}

const DEFAULT_CONFIG: ScoringConfig = {
  compliantThreshold: 80,
  partialThreshold: 50,
  priorityWeights: {
    CRITICAL: 4.0,
    HIGH: 2.0,
    MEDIUM: 1.0,
    LOW: 0.5,
  },
};

export function ComplianceScoringConfigForm() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [config, setConfig] = useState<ScoringConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/frameworks?pageSize=50');
      if (response.ok) {
        const data = await response.json();
        setFrameworks(data.items || []);
        if (data.items?.length > 0) {
          setSelectedFrameworkId(data.items[0].id);
          loadFrameworkConfig(data.items[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load frameworks');
    } finally {
      setLoading(false);
    }
  };

  const loadFrameworkConfig = (framework: Framework) => {
    if (framework.scoringConfig) {
      setConfig({
        ...DEFAULT_CONFIG,
        ...framework.scoringConfig,
        priorityWeights: {
          ...DEFAULT_CONFIG.priorityWeights,
          ...(framework.scoringConfig.priorityWeights || {}),
        },
      });
    } else {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const handleFrameworkChange = (frameworkId: string) => {
    setSelectedFrameworkId(frameworkId);
    const framework = frameworks.find(f => f.id === frameworkId);
    if (framework) {
      loadFrameworkConfig(framework);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFrameworkId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/frameworks/${selectedFrameworkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoringConfig: config }),
      });

      if (response.ok) {
        toast.success('Scoring configuration saved');
        // Update local state
        setFrameworks(prev =>
          prev.map(f =>
            f.id === selectedFrameworkId ? { ...f, scoringConfig: config } : f
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Framework Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Compliance Scoring Configuration
          </CardTitle>
          <CardDescription>
            Customize compliance thresholds and control priority weights per framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="framework">Select Framework</Label>
            <Select value={selectedFrameworkId} onValueChange={handleFrameworkChange}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map(fw => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.shortName} - {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Compliance Thresholds
          </CardTitle>
          <CardDescription>
            Define effectiveness thresholds for compliance status classification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="compliantThreshold">Compliant Threshold</Label>
                <Badge variant="default" className="bg-green-500">
                  ≥ {config.compliantThreshold}%
                </Badge>
              </div>
              <Input
                id="compliantThreshold"
                type="number"
                min={51}
                max={100}
                value={config.compliantThreshold}
                onChange={e => {
                  const value = parseInt(e.target.value) || 80;
                  setConfig(prev => ({
                    ...prev,
                    compliantThreshold: Math.max(Math.min(value, 100), prev.partialThreshold + 1),
                  }));
                }}
              />
              <p className="text-xs text-muted-foreground">
                Controls with effectiveness ≥ this threshold are marked as Compliant
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="partialThreshold">Partial Threshold</Label>
                <Badge variant="secondary" className="bg-yellow-500 text-black">
                  ≥ {config.partialThreshold}%
                </Badge>
              </div>
              <Input
                id="partialThreshold"
                type="number"
                min={1}
                max={99}
                value={config.partialThreshold}
                onChange={e => {
                  const value = parseInt(e.target.value) || 50;
                  setConfig(prev => ({
                    ...prev,
                    partialThreshold: Math.min(Math.max(value, 1), prev.compliantThreshold - 1),
                  }));
                }}
              />
              <p className="text-xs text-muted-foreground">
                Controls between this and compliant threshold are marked as Partial
              </p>
            </div>
          </div>

          {/* Visual representation */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Classification Preview</p>
            <div className="flex h-6 rounded-full overflow-hidden">
              <div
                className="bg-red-500 flex items-center justify-center text-xs text-white"
                style={{ width: `${config.partialThreshold}%` }}
              >
                Non-Compliant
              </div>
              <div
                className="bg-yellow-500 flex items-center justify-center text-xs"
                style={{ width: `${config.compliantThreshold - config.partialThreshold}%` }}
              >
                Partial
              </div>
              <div
                className="bg-green-500 flex items-center justify-center text-xs text-white"
                style={{ width: `${100 - config.compliantThreshold}%` }}
              >
                Compliant
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>{config.partialThreshold}%</span>
              <span>{config.compliantThreshold}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Control Priority Weights
          </CardTitle>
          <CardDescription>
            Higher weights give more importance to controls of that priority level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(priority => (
              <div key={priority} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`weight-${priority}`}>
                    <Badge
                      variant={
                        priority === 'CRITICAL'
                          ? 'destructive'
                          : priority === 'HIGH'
                          ? 'default'
                          : priority === 'MEDIUM'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {priority}
                    </Badge>
                  </Label>
                  <span className="text-sm font-mono">
                    {config.priorityWeights[priority]}x
                  </span>
                </div>
                <Input
                  id={`weight-${priority}`}
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={config.priorityWeights[priority]}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      priorityWeights: {
                        ...prev.priorityWeights,
                        [priority]: parseFloat(e.target.value) || 1,
                      },
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Example: A CRITICAL control with weight 4.0 has 4x the impact on the compliance
            score compared to a MEDIUM control with weight 1.0
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving || !selectedFrameworkId}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </form>
  );
}
