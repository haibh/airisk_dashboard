/**
 * API Route: Get control mappings between frameworks
 * GET /api/frameworks/mappings?source=:sourceId&target=:targetId
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceFrameworkId = searchParams.get('source');
    const targetFrameworkId = searchParams.get('target');

    // Build query filter
    const where: any = {};
    if (sourceFrameworkId) {
      where.sourceFrameworkId = sourceFrameworkId;
    }
    if (targetFrameworkId) {
      where.targetFrameworkId = targetFrameworkId;
    }

    const mappings = await prisma.controlMapping.findMany({
      where,
      include: {
        sourceControl: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        targetControl: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        sourceFramework: {
          select: {
            id: true,
            shortName: true,
            name: true,
          },
        },
        targetFramework: {
          select: {
            id: true,
            shortName: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Error fetching mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mappings' },
      { status: 500 }
    );
  }
}
