'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Shield, BarChart3, Brain, ArrowRight, Lock, Network, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingAIRiskScene } from './landing-ai-risk-scene';
import { LandingContentSections } from './landing-page-content-sections';

interface LandingPageProps {
  locale: string;
}

/**
 * Theme-adaptive landing page — Hero + Features + Content + CTA pattern.
 * Performance-first: pure CSS animations, no JS mouse tracking.
 * Responsive: 375 -> 768 -> 1024 -> 1440px.
 * Accessible: cursor-pointer, focus-visible, prefers-reduced-motion.
 */
export function LandingPage({ locale }: LandingPageProps) {
  const t = useTranslations('landing');

  return (
    <div className="landing-gradient min-h-screen relative overflow-hidden flex flex-col">
      <LandingAIRiskScene />

      {/* ── Floating nav bar ──────────────────────────────────────── */}
      <nav className="landing-nav relative z-20 mx-4 mt-4 md:mx-8 md:mt-5 flex items-center justify-between px-5 py-3 rounded-2xl">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label="AIRM-IP home"
        >
          <div className="landing-nav-logo flex items-center justify-center w-9 h-9 transition-colors duration-200 group-hover:bg-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight landing-gradient-text hidden sm:inline">
            AIRM-IP
          </span>
        </Link>
        <Link href={`/${locale}/login`} className="cursor-pointer">
          <Button
            size="sm"
            className="landing-cta-btn cursor-pointer rounded-lg px-4 sm:px-5 text-sm transition-all duration-200"
          >
            {t('loginButton')}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </nav>

      {/* ── Hero section ──────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 sm:px-6">
        <section className="flex flex-col items-center text-center mt-10 sm:mt-14 md:mt-20 mb-12 md:mb-16 max-w-3xl">
          {/* Animated logo — morphs on hover */}
          <div className="mb-5 sm:mb-6 ai-scene-logo-float">
            <div className="landing-shape-morph relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 cursor-pointer">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary drop-shadow-[0_0_14px_hsl(var(--primary)/0.6)]" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-5 landing-gradient-text leading-[1.1]">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-3 sm:mb-4 font-light leading-relaxed">
            {t('subtitle')}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/60 mb-8 sm:mb-10 max-w-xl leading-relaxed">
            {t('description')}
          </p>

          {/* Primary CTA */}
          <Link href={`/${locale}/login`} className="cursor-pointer">
            <Button
              size="lg"
              className="landing-cta-btn cursor-pointer group text-base sm:text-lg px-7 sm:px-8 py-5 rounded-xl transition-all duration-200"
            >
              {t('getStarted')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </section>

        {/* ── Key features grid (6 cards, responsive) ─────────────── */}
        <section className="w-full max-w-5xl mb-16 md:mb-20">
          <h2 className="text-center text-xs sm:text-sm uppercase tracking-widest text-muted-foreground/50 mb-6 sm:mb-8">
            {t('featuresHeading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feat, i) => (
              <div key={i} className="landing-feature-card group cursor-default">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-primary/15">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-foreground font-semibold text-sm">{t(feat.titleKey)}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(feat.descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Comprehensive content sections ──────────────────────── */}
        <LandingContentSections />
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-5 sm:py-6 text-center text-xs text-muted-foreground/50 border-t border-border/30">
        <p>&copy; 2026 AIRM-IP &middot; AI Risk Management Intelligence Platform</p>
      </footer>
    </div>
  );
}

/* ── Feature definitions (Lucide SVG icons) ─────────────────────────── */

const features = [
  { icon: Shield, titleKey: 'features.riskTitle', descKey: 'features.riskDesc' },
  { icon: BarChart3, titleKey: 'features.complianceTitle', descKey: 'features.complianceDesc' },
  { icon: Brain, titleKey: 'features.governanceTitle', descKey: 'features.governanceDesc' },
  { icon: Eye, titleKey: 'features.monitoringTitle', descKey: 'features.monitoringDesc' },
  { icon: Network, titleKey: 'features.frameworksTitle', descKey: 'features.frameworksDesc' },
  { icon: Lock, titleKey: 'features.securityTitle', descKey: 'features.securityDesc' },
];
