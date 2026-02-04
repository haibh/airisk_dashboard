/**
 * API Route: Get single framework with controls
 * GET /api/frameworks/:id
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, notFoundError } from '@/lib/api-error-handler';

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
      return notFoundError('Framework');
    }

    return NextResponse.json(framework);
  } catch (error) {
    return handleApiError(error, 'fetching framework');
  }
}
