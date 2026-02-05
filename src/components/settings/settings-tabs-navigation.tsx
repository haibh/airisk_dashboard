'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { Building2, Users, User, Key, Webhook, Scale } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { hasMinimumRole } from '@/lib/auth-helpers';

interface Tab {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const tabs: Tab[] = [
  {
    href: '/settings/organization',
    labelKey: 'settings.tabs.organization',
    icon: Building2,
    adminOnly: true,
  },
  {
    href: '/settings/users',
    labelKey: 'settings.tabs.users',
    icon: Users,
    adminOnly: true,
  },
  {
    href: '/settings/api-keys',
    labelKey: 'settings.tabs.apiKeys',
    icon: Key,
    adminOnly: true,
  },
  {
    href: '/settings/webhooks',
    labelKey: 'settings.tabs.webhooks',
    icon: Webhook,
    adminOnly: true,
  },
  {
    href: '/settings/compliance-scoring',
    labelKey: 'settings.tabs.complianceScoring',
    icon: Scale,
    adminOnly: true,
  },
  {
    href: '/settings/profile',
    labelKey: 'settings.tabs.profile',
    icon: User,
  },
];

export function SettingsTabsNavigation() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();

  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '';
  const isAdmin = session?.user?.role && hasMinimumRole(session.user.role, 'ADMIN');

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="flex flex-col gap-1">
      {visibleTabs.map((tab) => {
        const isActive = pathWithoutLocale === tab.href || pathWithoutLocale.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <tab.icon className="h-5 w-5 flex-shrink-0" />
            <span>{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </div>
  );
}
