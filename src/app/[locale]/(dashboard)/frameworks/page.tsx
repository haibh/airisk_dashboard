/**
 * Frameworks List Page
 * Displays all available compliance frameworks
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, BookOpen, FileText } from 'lucide-react';
import { prisma } from '@/lib/db';
import { FrameworkCategory } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Compliance Frameworks',
  description: 'Browse AI risk and compliance frameworks',
};

const categoryIcons: Record<FrameworkCategory, React.ReactNode> = {
  AI_RISK: <Shield className="w-5 h-5" />,
  AI_MANAGEMENT: <BookOpen className="w-5 h-5" />,
  AI_CONTROL: <FileText className="w-5 h-5" />,
  SECURITY: <Shield className="w-5 h-5" />,
  COMPLIANCE: <FileText className="w-5 h-5" />,
};

const categoryColors: Record<FrameworkCategory, string> = {
  AI_RISK: 'bg-red-100 text-red-700',
  AI_MANAGEMENT: 'bg-blue-100 text-blue-700',
  AI_CONTROL: 'bg-green-100 text-green-700',
  SECURITY: 'bg-purple-100 text-purple-700',
  COMPLIANCE: 'bg-yellow-100 text-yellow-700',
};

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance Frameworks</h1>
        <p className="text-gray-600">
          Browse and explore AI risk management and compliance frameworks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((framework: any) => (
          <Link
            key={framework.id}
            href={`/frameworks/${framework.id}`}
            className="block"
          >
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${categoryColors[framework.category as FrameworkCategory]}`}
                >
                  {categoryIcons[framework.category as FrameworkCategory]}
                </div>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  v{framework.version}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {framework.shortName}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {framework.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {framework._count.controls} controls
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${categoryColors[framework.category as FrameworkCategory]}`}
                >
                  {framework.category.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {frameworks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No frameworks available
          </h3>
          <p className="text-gray-500">
            Run database seed to populate frameworks
          </p>
        </div>
      )}
    </div>
  );
}
