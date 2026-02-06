import { Metadata } from 'next';
import { SupplyChainDashboardPage } from '@/components/supply-chain/supply-chain-dashboard-page';

export const metadata: Metadata = {
  title: 'Supply Chain Risk Mapping',
  description: 'Visualize vendor risk propagation across your AI supply chain',
};

export default function SupplyChainPage() {
  return <SupplyChainDashboardPage />;
}
