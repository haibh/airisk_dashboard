import { Metadata } from 'next';
import { BenchmarkingDashboardPage } from '@/components/benchmarking/benchmarking-dashboard-page';

export const metadata: Metadata = {
  title: 'Peer Benchmarking',
  description: 'Compare your risk posture against industry peers anonymously',
};

export default function BenchmarkingPage() {
  return <BenchmarkingDashboardPage />;
}
