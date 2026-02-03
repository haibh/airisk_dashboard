/**
 * Framework Detail Page
 * Displays framework information and control tree
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Shield } from 'lucide-react';
import { prisma } from '@/lib/db';
import { FrameworkControlTree } from '@/components/frameworks/framework-control-tree';

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
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Frameworks
      </Link>

      {/* Framework header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">{framework.shortName}</h1>
              <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                v{framework.version}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{framework.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          {framework.effectiveDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Effective: {new Date(framework.effectiveDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">
              {framework._count.controls}
            </span>{' '}
            total controls
          </div>
          <div>
            <span
              className={`px-2 py-1 rounded text-xs ${
                framework.category === 'AI_RISK'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {framework.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Controls tree */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Controls Hierarchy</h2>
        <FrameworkControlTree controls={controlTree} />
      </div>
    </div>
  );
}
