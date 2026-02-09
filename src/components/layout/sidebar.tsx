'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  FileCheck,
  Folder,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  GitCompare,
  Network,
  ScrollText,
  Users,
  Calculator,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/store';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/ai-systems', icon: Cpu, labelKey: 'nav.aiSystems' },
  { href: '/risk-assessment', icon: AlertTriangle, labelKey: 'nav.riskAssessment' },
  { href: '/frameworks', icon: FileCheck, labelKey: 'nav.frameworks' },
  { href: '/gap-analysis', icon: GitCompare, labelKey: 'nav.gapAnalysis' },
  { href: '/evidence', icon: Folder, labelKey: 'nav.evidence' },
  { href: '/reports', icon: BarChart3, labelKey: 'nav.reports' },
  { href: '/tasks', icon: CheckSquare, labelKey: 'nav.tasks' },
  { href: '/supply-chain', icon: Network, labelKey: 'nav.supplyChain' },
  { href: '/regulatory', icon: ScrollText, labelKey: 'nav.regulatory' },
  { href: '/benchmarking', icon: Users, labelKey: 'nav.benchmarking' },
  { href: '/roi-calculator', icon: Calculator, labelKey: 'nav.roiCalculator' },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // Remove locale prefix from pathname for comparison
  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '';

  return (
    <aside
      className={cn(
        'flex h-full flex-col internal-sidebar transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          {sidebarOpen && (
            <span className="text-lg font-bold">{t('common.appNameShort')}</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              !sidebarOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathWithoutLocale === item.href ||
            pathWithoutLocale.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium internal-sidebar-item',
                isActive
                  ? 'internal-sidebar-item-active'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Settings */}
      <div className="p-2">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium internal-sidebar-item',
            pathWithoutLocale === '/settings'
              ? 'internal-sidebar-item-active'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>{t('nav.settings')}</span>}
        </Link>
      </div>
    </aside>
  );
}
