import { useTranslations } from 'next-intl';
import { SettingsTabsNavigation } from '@/components/settings/settings-tabs-navigation';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization and user preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <Card className="p-4">
            <SettingsTabsNavigation />
          </Card>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <Card className="p-6">{children}</Card>
        </div>
      </div>
    </div>
  );
}
