'use client';

import { useTranslations } from 'next-intl';
import {
  Shield, BarChart3, Network, FileCheck, ClipboardList, Plug,
  CheckCircle2, FlaskConical, Database, Layers, Users, Accessibility,
} from 'lucide-react';

/**
 * Content sections for the landing page below the hero feature grid.
 * Includes: stats bar, supported frameworks, capabilities, methodology, architecture.
 * All text from i18n `landing.*` namespace. Theme-adaptive via CSS token classes.
 */
export function LandingContentSections() {
  const t = useTranslations('landing');

  return (
    <>
      <StatsBar t={t} />
      <FrameworksGrid t={t} />
      <CapabilitiesGrid t={t} />
      <MethodologySection t={t} />
      <ArchitectureSection t={t} />
    </>
  );
}

/* ── Stats Bar ──────────────────────────────────────────────────────── */

function StatsBar({ t }: { t: ReturnType<typeof useTranslations<'landing'>> }) {
  const stats = [
    { icon: FlaskConical, key: 'stats.tests' },
    { icon: Database, key: 'stats.models' },
    { icon: Layers, key: 'stats.frameworks' },
    { icon: Users, key: 'stats.roles' },
    { icon: Accessibility, key: 'stats.wcag' },
  ] as const;

  return (
    <section className="w-full max-w-5xl mb-12 md:mb-16">
      <h2 className="text-center text-xs sm:text-sm uppercase tracking-widest text-muted-foreground/60 mb-5 sm:mb-6">
        {t('stats.heading')}
      </h2>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="landing-section-card flex items-center gap-2 px-4 py-2.5 text-sm">
            <stat.icon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-foreground font-medium whitespace-nowrap">{t(stat.key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Supported Frameworks Grid ──────────────────────────────────────── */

const frameworkKeys = [
  'nistAiRmf', 'iso42001', 'csaAicm', 'nistCsf',
  'iso27001', 'cisControls', 'pciDss', 'scf',
] as const;

function FrameworksGrid({ t }: { t: ReturnType<typeof useTranslations<'landing'>> }) {
  return (
    <section className="w-full max-w-5xl mb-12 md:mb-16">
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-2">
        {t('supportedFrameworks.heading')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {frameworkKeys.map((key) => (
          <div key={key} className="landing-section-card flex items-center justify-center px-3 py-3 text-center">
            <span className="text-sm font-medium text-foreground">{t(`supportedFrameworks.${key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Platform Capabilities ──────────────────────────────────────────── */

const capabilities = [
  { icon: Shield, titleKey: 'capabilities.inventoryTitle', descKey: 'capabilities.inventoryDesc' },
  { icon: BarChart3, titleKey: 'capabilities.assessmentTitle', descKey: 'capabilities.assessmentDesc' },
  { icon: Network, titleKey: 'capabilities.mappingTitle', descKey: 'capabilities.mappingDesc' },
  { icon: FileCheck, titleKey: 'capabilities.evidenceTitle', descKey: 'capabilities.evidenceDesc' },
  { icon: ClipboardList, titleKey: 'capabilities.auditTitle', descKey: 'capabilities.auditDesc' },
  { icon: Plug, titleKey: 'capabilities.integrationTitle', descKey: 'capabilities.integrationDesc' },
] as const;

function CapabilitiesGrid({ t }: { t: ReturnType<typeof useTranslations<'landing'>> }) {
  return (
    <section className="w-full max-w-5xl mb-12 md:mb-16">
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-6">
        {t('capabilities.heading')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((cap, i) => (
          <div key={i} className="landing-feature-card group cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/15">
                <cap.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold text-sm">{t(cap.titleKey)}</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{t(cap.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Risk Methodology ──────────────────────────────────────────────── */

const riskLevels = [
  { key: 'low', color: 'bg-emerald-500' },
  { key: 'medium', color: 'bg-yellow-500' },
  { key: 'high', color: 'bg-orange-500' },
  { key: 'critical', color: 'bg-red-500' },
] as const;

function MethodologySection({ t }: { t: ReturnType<typeof useTranslations<'landing'>> }) {
  return (
    <section className="w-full max-w-3xl mb-12 md:mb-16">
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-5">
        {t('methodology.heading')}
      </h2>
      <div className="landing-section-card p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-mono text-foreground">{t('methodology.formula')}</p>
          <p className="text-sm font-mono text-muted-foreground">{t('methodology.residual')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {riskLevels.map((level) => (
            <div key={level.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${level.color}`} />
              <span className="text-sm text-muted-foreground">{t(`methodology.levels.${level.key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Architecture Highlights ────────────────────────────────────────── */

const techStack = [
  'React 19', 'Next.js 16', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'Tailwind CSS',
];

function ArchitectureSection({ t }: { t: ReturnType<typeof useTranslations<'landing'>> }) {
  return (
    <section className="w-full max-w-3xl mb-12 md:mb-16">
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-5">
        {t('architecture.heading')}
      </h2>
      <div className="flex flex-wrap justify-center gap-2.5">
        {techStack.map((tech) => (
          <div key={tech} className="landing-section-card px-3.5 py-2 text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground font-medium">{tech}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
