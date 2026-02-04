import { LandingPage } from '@/components/landing/landing-page';

interface RootPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Root page — renders the marketing landing page with AI Risk
 * themed background, interactive effects, and Login CTA.
 */
export default async function RootPage({ params }: RootPageProps) {
  const { locale } = await params;
  return <LandingPage locale={locale} />;
}
