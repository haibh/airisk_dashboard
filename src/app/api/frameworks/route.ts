/**
 * API Route: List all frameworks
 * GET /api/frameworks
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const frameworks = await prisma.framework.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { controls: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(frameworks);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frameworks' },
      { status: 500 }
    );
  }
}
