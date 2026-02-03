/**
 * API Route: Get controls for framework in tree structure
 * GET /api/frameworks/:id/controls
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get all controls for framework
    const controls = await prisma.control.findMany({
      where: { frameworkId: id },
      orderBy: { sortOrder: 'asc' },
    });

    // Build tree structure (only root level controls)
    const rootControls = controls.filter((c: any) => !c.parentId);

    // Recursive function to build tree
    const buildTree = (parentId: string) => {
      return controls
        .filter((c: any) => c.parentId === parentId)
        .map((control: any) => ({
          ...control,
          children: buildTree(control.id),
        }));
    };

    // Build complete tree
    const tree = rootControls.map((control: any) => ({
      ...control,
      children: buildTree(control.id),
    }));

    return NextResponse.json(tree);
  } catch (error) {
    console.error('Error fetching controls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch controls' },
      { status: 500 }
    );
  }
}
