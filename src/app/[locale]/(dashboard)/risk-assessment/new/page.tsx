'use client';

import { useEffect, useState } from 'react';
import { AssessmentCreationWizard } from '@/components/risk-assessment/assessment-creation-wizard';
import { AISystemWithOwner, AISystemListResponse } from '@/types/ai-system';

export default function NewAssessmentPage() {
  const [aiSystems, setAiSystems] = useState<AISystemWithOwner[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch AI systems
      const systemsResponse = await fetch('/api/ai-systems?pageSize=100');
      if (systemsResponse.ok) {
        const systemsData: AISystemListResponse =
          await systemsResponse.json();
        setAiSystems(systemsData.systems);
      }

      // Fetch frameworks
      const frameworksResponse = await fetch('/api/frameworks');
      if (frameworksResponse.ok) {
        const frameworksData = await frameworksResponse.json();
        setFrameworks(frameworksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Risk Assessment</h1>
        <p className="text-gray-600 mt-1">
          Follow the steps to create a comprehensive risk assessment
        </p>
      </div>

      <AssessmentCreationWizard
        aiSystems={aiSystems}
        frameworks={frameworks}
      />
    </div>
  );
}
