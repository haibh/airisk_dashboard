/**
 * API Route: Get single framework with controls
 * GET /api/frameworks/:id
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const framework = await prisma.framework.findUnique({
      where: { id },
      include: {
        controls: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { controls: true },
        },
      },
    });

    if (!framework) {
      return NextResponse.json(
        { error: 'Framework not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(framework);
  } catch (error) {
    console.error('Error fetching framework:', error);
    return NextResponse.json(
      { error: 'Failed to fetch framework' },
      { status: 500 }
    );
  }
}
