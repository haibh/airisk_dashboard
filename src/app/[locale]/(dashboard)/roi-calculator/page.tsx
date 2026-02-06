import { Metadata } from 'next';
import { ROICalculatorPage } from '@/components/roi-calculator/roi-calculator-page';

export const metadata: Metadata = {
  title: 'ROI Calculator',
  description: 'Quantify the financial value of risk mitigation investments',
};

export default function ROIPage() {
  return <ROICalculatorPage />;
}
