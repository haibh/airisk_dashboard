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

/** 5x5 risk matrix cell colors based on score (likelihood × impact) */
function getRiskCellColor(score: number): string {
  if (score <= 4) return 'bg-emerald-500/80 dark:bg-emerald-500/70';
  if (score <= 9) return 'bg-yellow-500/80 dark:bg-yellow-500/70';
  if (score <= 16) return 'bg-orange-500/80 dark:bg-orange-500/70';
  return 'bg-red-500/80 dark:bg-red-500/70';
}

const riskLevels = [
  { key: 'low', range: '1-4', color: 'bg-emerald-500' },
  { key: 'medium', range: '5-9', color: 'bg-yellow-500' },
  { key: 'high', range: '10-16', color: 'bg-orange-500' },
  { key: 'critical', range: '17-25', color: 'bg-red-500' },
] as const;

function MethodologySection({ t }: { t: ReturnType<typeof useTranslations<'landing'>> }) {
  // 5x5 matrix: rows = impact (5→1), cols = likelihood (1→5)
  const matrix = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => (5 - row) * (col + 1))
  );

  return (
    <section className="w-full max-w-4xl mb-12 md:mb-16">
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-6">
        {t('methodology.heading')}
      </h2>

      <div className="landing-section-card p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
          {/* 5×5 Risk Matrix Grid */}
          <div className="flex-shrink-0">
            <div className="flex items-stretch gap-1">
              {/* Y-axis label */}
              <div className="flex items-center justify-center w-5 -mr-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium -rotate-90 whitespace-nowrap">
                  {t('methodology.impact')}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {/* Y-axis numbers + grid rows */}
                {matrix.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex items-center gap-0.5">
                    <span className="w-4 text-[10px] sm:text-xs text-muted-foreground text-right pr-0.5">
                      {5 - rowIdx}
                    </span>
                    {row.map((score, colIdx) => (
                      <div
                        key={colIdx}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-sm flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white shadow-sm ${getRiskCellColor(score)}`}
                        title={`Likelihood ${colIdx + 1} × Impact ${5 - rowIdx} = ${score}`}
                      >
                        {score}
                      </div>
                    ))}
                  </div>
                ))}

                {/* X-axis numbers */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="w-4" />
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="w-7 sm:w-9 text-center text-[10px] sm:text-xs text-muted-foreground">
                      {n}
                    </span>
                  ))}
                </div>

                {/* X-axis label */}
                <div className="text-center mt-1">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    {t('methodology.likelihood')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend + Formula */}
          <div className="flex-1 space-y-4">
            {/* Risk Level Legend */}
            <div className="grid grid-cols-2 gap-2">
              {riskLevels.map((level) => (
                <div key={level.key} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30">
                  <div className={`w-4 h-4 rounded ${level.color} shadow-sm`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground capitalize">
                      {t(`methodology.levels.${level.key}`)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{level.range}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Control Effectiveness Visual */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded bg-orange-500/80 flex items-center justify-center text-[10px] font-bold text-white">15</div>
                  <span className="text-xs text-muted-foreground">×</span>
                  <span className="text-xs font-medium text-foreground">(1 - 60%)</span>
                </div>
                <span className="text-muted-foreground">=</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded bg-yellow-500/80 flex items-center justify-center text-[10px] font-bold text-white">6</div>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                {t('methodology.controlExample')}
              </p>
            </div>
          </div>
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
