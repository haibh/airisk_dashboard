import { useTranslations } from 'next-intl';
import { Link } from '@/components/ui/link';
import {
  Shield,
  BarChart3,
  FileCheck,
  Users,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">{t('common.appNameShort')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t('nav.dashboard')}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {t('common.appName')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Enterprise platform for managing AI risks end-to-end. Map NIST AI RMF,
            ISO 42001, and security frameworks. Ensure compliance and audit-readiness.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/frameworks"
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
            >
              View Frameworks <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Risk Assessment"
              description="5×5 risk matrix with inherent and residual risk tracking"
            />
            <FeatureCard
              icon={<FileCheck className="h-6 w-6" />}
              title="Framework Mapping"
              description="NIST AI RMF, ISO 42001, and security framework crosswalks"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics Dashboard"
              description="Executive dashboards with compliance scorecards"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Evidence Management"
              description="Hash-verified evidence with audit trail logging"
            />
          </div>
        </div>

        {/* Supported Frameworks */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <h2 className="text-2xl font-bold">Supported Frameworks</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <FrameworkBadge name="NIST AI RMF 1.0" />
            <FrameworkBadge name="ISO/IEC 42001:2023" />
            <FrameworkBadge name="CSA AICM" />
            <FrameworkBadge name="NIST CSF 2.0" />
            <FrameworkBadge name="CIS Controls v8" />
            <FrameworkBadge name="PCI DSS 4.0" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 AI Risk Management Intelligence Platform (AIRM-IP)</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 inline-flex rounded-md bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FrameworkBadge({ name }: { name: string }) {
  return (
    <span className="rounded-full border bg-background px-4 py-2 text-sm font-medium">
      {name}
    </span>
  );
}
