/**
 * API Route: Get/Update single framework
 * GET /api/frameworks/:id - Get framework with controls
 * PATCH /api/frameworks/:id - Update framework (scoringConfig, etc.)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, notFoundError, unauthorizedError, forbiddenError } from '@/lib/api-error-handler';

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

/**
 * PATCH /api/frameworks/:id - Update framework configuration
 * Requires RISK_MANAGER+ role
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Require RISK_MANAGER or higher to update framework config
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError('Risk Manager role or higher required');
    }

    const { id } = await params;
    const body = await request.json();

    // Verify framework exists
    const existing = await prisma.framework.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundError('Framework');
    }

    // Only allow updating scoringConfig for now
    const updateData: { scoringConfig?: object } = {};

    if (body.scoringConfig !== undefined) {
      // Validate scoring config structure
      const config = body.scoringConfig;
      if (config && typeof config === 'object') {
        const validConfig = {
          compliantThreshold: Math.min(100, Math.max(1, config.compliantThreshold ?? 80)),
          partialThreshold: Math.min(99, Math.max(0, config.partialThreshold ?? 50)),
          priorityWeights: {
            CRITICAL: Math.max(0.1, config.priorityWeights?.CRITICAL ?? 4.0),
            HIGH: Math.max(0.1, config.priorityWeights?.HIGH ?? 2.0),
            MEDIUM: Math.max(0.1, config.priorityWeights?.MEDIUM ?? 1.0),
            LOW: Math.max(0.1, config.priorityWeights?.LOW ?? 0.5),
          },
        };
        // Ensure compliant > partial
        if (validConfig.compliantThreshold <= validConfig.partialThreshold) {
          validConfig.compliantThreshold = validConfig.partialThreshold + 1;
        }
        updateData.scoringConfig = validConfig;
      }
    }

    const updated = await prisma.framework.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Framework updated successfully',
      data: updated,
    });
  } catch (error) {
    return handleApiError(error, 'updating framework');
  }
}
