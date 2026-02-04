/**
 * API Route: Get controls for framework in tree structure
 * GET /api/frameworks/:id/controls
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/api-error-handler';
import { Control } from '@prisma/client';
import { getFromCache } from '@/lib/cache-advanced';
import { CACHE_KEYS, TTL } from '@/lib/cache-service';

// Type for control with children
interface ControlWithChildren extends Control {
  children: ControlWithChildren[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use advanced caching with stale-while-revalidate
    const tree = await getFromCache(
      CACHE_KEYS.CONTROL_TREE(id),
      async () => {
        // Get all controls for framework
        const controls = await prisma.control.findMany({
          where: { frameworkId: id },
          orderBy: { sortOrder: 'asc' },
        });

        // Build tree structure (only root level controls)
        const rootControls = controls.filter((c) => !c.parentId);

        // Recursive function to build tree with explicit return type
        const buildTree = (parentId: string): ControlWithChildren[] => {
          return controls
            .filter((c) => c.parentId === parentId)
            .map((control) => ({
              ...control,
              children: buildTree(control.id),
            }));
        };

        // Build complete tree
        const result: ControlWithChildren[] = rootControls.map((control) => ({
          ...control,
          children: buildTree(control.id),
        }));

        return result;
      },
      {
        ttl: TTL.CONTROL_TREE, // 1 hour
        staleWhileRevalidate: true,
        staleTTL: TTL.CONTROL_TREE * 2, // Serve stale for 2 hours
      }
    );

    return NextResponse.json(tree);
  } catch (error) {
    return handleApiError(error, 'fetching controls');
  }
}
