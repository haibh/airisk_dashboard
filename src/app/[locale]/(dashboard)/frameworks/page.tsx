/**
 * Frameworks List Page
 * Displays frameworks grouped by AI-Risk and Non-AI-Specific categories
 * Each framework has a distinct icon for visual identification
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
  BrainCircuit,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Target,
  CreditCard,
  Layers,
  BookOpen,
  Shield,
  FileText,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { FrameworkCategory } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Compliance Frameworks',
  description: 'Browse AI risk and compliance frameworks',
};

/** Categories that belong to the AI-Risk group */
const AI_CATEGORIES: FrameworkCategory[] = ['AI_RISK', 'AI_MANAGEMENT', 'AI_CONTROL'];

/** Per-framework icon mapping by shortName for distinct visual identity */
const frameworkIcons: Record<string, React.ReactNode> = {
  'NIST-AI-RMF': <BrainCircuit className="w-5 h-5" />,
  'ISO-42001':   <Settings2 className="w-5 h-5" />,
  'CSA-AICM':    <ShieldCheck className="w-5 h-5" />,
  'NIST-CSF':    <ShieldAlert className="w-5 h-5" />,
  'ISO-27001':   <Lock className="w-5 h-5" />,
  'CIS-CSC':     <Target className="w-5 h-5" />,
  'PCI-DSS':     <CreditCard className="w-5 h-5" />,
  'SCF':         <Layers className="w-5 h-5" />,
};

/** Fallback icons per category when shortName not matched */
const categoryFallbackIcons: Record<FrameworkCategory, React.ReactNode> = {
  AI_RISK:       <Shield className="w-5 h-5" />,
  AI_MANAGEMENT: <BookOpen className="w-5 h-5" />,
  AI_CONTROL:    <FileText className="w-5 h-5" />,
  SECURITY:      <Shield className="w-5 h-5" />,
  COMPLIANCE:    <FileText className="w-5 h-5" />,
};

const categoryColors: Record<FrameworkCategory, string> = {
  AI_RISK: 'bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-300',
  AI_MANAGEMENT: 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-300',
  AI_CONTROL: 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-300',
  SECURITY: 'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-300',
  COMPLIANCE: 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/30 dark:text-yellow-300',
};

/** Get the best icon for a framework: per-framework first, then category fallback */
function getFrameworkIcon(shortName: string, category: FrameworkCategory): React.ReactNode {
  return frameworkIcons[shortName] ?? categoryFallbackIcons[category];
}

export default async function FrameworksPage() {
  const frameworks = await prisma.framework.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { controls: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const aiFrameworks = frameworks.filter(
    (f: any) => AI_CATEGORIES.includes(f.category as FrameworkCategory)
  );
  const nonAiFrameworks = frameworks.filter(
    (f: any) => !AI_CATEGORIES.includes(f.category as FrameworkCategory)
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Compliance Frameworks</h1>
        <p className="text-muted-foreground">
          Browse and explore AI risk management and compliance frameworks
        </p>
      </div>

      {/* AI Risk Frameworks Section */}
      {aiFrameworks.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/20 dark:bg-red-500/30">
              <BrainCircuit className="w-5 h-5 text-red-600 dark:text-red-300" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">AI Risk Frameworks</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 ml-12">
            Frameworks specifically designed for AI risk management, governance, and control
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFrameworks.map((framework: any) => (
              <FrameworkCard key={framework.id} framework={framework} />
            ))}
          </div>
        </section>
      )}

      {/* Non-AI-Specific Frameworks Section */}
      {nonAiFrameworks.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 dark:bg-purple-500/30">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Non-AI-Specific Frameworks</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 ml-12">
            General security and compliance frameworks applicable to AI systems
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonAiFrameworks.map((framework: any) => (
              <FrameworkCard key={framework.id} framework={framework} />
            ))}
          </div>
        </section>
      )}

      {frameworks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No frameworks available
            </h3>
            <p className="text-muted-foreground">
              Run database seed to populate frameworks
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Reusable framework card component */
function FrameworkCard({ framework }: { framework: any }) {
  const category = framework.category as FrameworkCategory;
  return (
    <Link href={`/frameworks/${framework.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${categoryColors[category]}`}>
              {getFrameworkIcon(framework.shortName, category)}
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              v{framework.version}
            </span>
          </div>

          <h3 className="font-semibold text-lg mb-2 text-foreground">
            {framework.shortName}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {framework.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {framework._count.controls} controls
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[category]}`}
            >
              {category.replace('_', ' ')}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
