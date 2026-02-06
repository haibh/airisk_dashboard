import { Metadata } from 'next';
import { RegulatoryTrackerDashboardPage } from '@/components/regulatory-tracker/regulatory-tracker-dashboard-page';

export const metadata: Metadata = {
  title: 'Regulatory Change Tracker',
  description: 'Monitor regulatory changes and their impact on your compliance posture',
};

export default function RegulatoryPage() {
  return <RegulatoryTrackerDashboardPage />;
}
