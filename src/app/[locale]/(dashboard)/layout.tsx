import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden dashboard-enhanced">
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-muted/30 p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
