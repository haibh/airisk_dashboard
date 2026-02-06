/**
 * GET /api/compliance-graph/chains/[id] - Get single compliance chain
 * PUT /api/compliance-graph/chains/[id] - Update compliance chain
 * DELETE /api/compliance-graph/chains/[id] - Delete compliance chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  requirement: z.string().min(1).max(1000).optional(),
  policyId: z.string().optional(),
  controlId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  chainStatus: z.enum(['COMPLETE', 'PARTIAL', 'MISSING']).optional(),
});

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { id } = await context.params;

    const chain = await prisma.complianceChain.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        control: {
          select: {
            id: true,
            code: true,
            title: true,
            frameworkId: true,
          },
        },
      },
    });

    if (!chain) {
      return notFoundError('Compliance chain');
    }

    return NextResponse.json({ chain });
  } catch (error) {
    return handleApiError(error, 'fetching compliance chain');
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await context.params;

    // Verify chain exists and belongs to org
    const existingChain = await prisma.complianceChain.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingChain) {
      return notFoundError('Compliance chain');
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Verify control exists if provided
    if (data.controlId) {
      const control = await prisma.control.findUnique({
        where: { id: data.controlId },
      });
      if (!control) {
        return validationError('Control not found', { field: 'controlId' });
      }
    }

    const updatedChain = await prisma.complianceChain.update({
      where: { id },
      data,
      include: {
        control: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      chain: updatedChain,
    });
  } catch (error) {
    return handleApiError(error, 'updating compliance chain');
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await context.params;

    // Verify chain exists and belongs to org
    const chain = await prisma.complianceChain.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!chain) {
      return notFoundError('Compliance chain');
    }

    await prisma.complianceChain.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Compliance chain deleted',
    });
  } catch (error) {
    return handleApiError(error, 'deleting compliance chain');
  }
}
