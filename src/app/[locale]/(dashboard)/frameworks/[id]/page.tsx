/**
 * Framework Detail Page
 * Displays framework information and control tree
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Shield } from 'lucide-react';
import { prisma } from '@/lib/db';
import { FrameworkControlsTable } from '@/components/frameworks/framework-controls-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const framework = await prisma.framework.findUnique({
    where: { id },
    select: { name: true, shortName: true },
  });

  if (!framework) {
    return { title: 'Framework Not Found' };
  }

  return {
    title: framework.shortName,
    description: framework.name,
  };
}

export default async function FrameworkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const framework = await prisma.framework.findUnique({
    where: { id },
    include: {
      _count: {
        select: { controls: true },
      },
    },
  });

  if (!framework) {
    notFound();
  }

  // Fetch controls in tree structure
  const allControls = await prisma.control.findMany({
    where: { frameworkId: id },
    orderBy: { sortOrder: 'asc' },
  });

  // Build tree
  const rootControls = allControls.filter((c: any) => !c.parentId);
  const buildTree = (parentId: string): any[] => {
    return allControls
      .filter((c: any) => c.parentId === parentId)
      .map((control: any) => ({
        ...control,
        children: buildTree(control.id),
      }));
  };

  const controlTree = rootControls.map((control: any) => ({
    ...control,
    children: buildTree(control.id),
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <Link
        href="/frameworks"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Frameworks
      </Link>

      {/* Framework header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">{framework.shortName}</h1>
                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  v{framework.version}
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{framework.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {framework.effectiveDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Effective: {new Date(framework.effectiveDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-foreground">
                {framework._count.controls}
              </span>{' '}
              total controls
            </div>
            <div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  framework.category === 'AI_RISK'
                    ? 'bg-red-500/20 text-red-400 dark:bg-red-500/30 dark:text-red-300'
                    : 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-300'
                }`}
              >
                {framework.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Controls & Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <FrameworkControlsTable controls={controlTree} />
        </CardContent>
      </Card>
    </div>
  );
}
