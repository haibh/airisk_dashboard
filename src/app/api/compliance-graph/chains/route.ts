/**
 * GET /api/compliance-graph/chains - List compliance chains
 * POST /api/compliance-graph/chains - Create compliance chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  frameworkId: z.string().optional(),
  controlId: z.string().optional(),
  chainStatus: z.enum(['COMPLETE', 'PARTIAL', 'MISSING']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  requirement: z.string().min(1).max(1000),
  policyId: z.string().optional(),
  controlId: z.string().optional(),
  evidenceIds: z.array(z.string()).default([]),
  chainStatus: z.enum(['COMPLETE', 'PARTIAL', 'MISSING']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      frameworkId: searchParams.get('frameworkId') || undefined,
      controlId: searchParams.get('controlId') || undefined,
      chainStatus: searchParams.get('chainStatus') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    });

    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (query.controlId) {
      where.controlId = query.controlId;
    }

    if (query.chainStatus) {
      where.chainStatus = query.chainStatus;
    }

    // Filter by framework via control relationship
    if (query.frameworkId) {
      where.control = {
        frameworkId: query.frameworkId,
      };
    }

    const [chains, total] = await Promise.all([
      prisma.complianceChain.findMany({
        where,
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
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complianceChain.count({ where }),
    ]);

    return NextResponse.json({
      chains,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    return handleApiError(error, 'fetching compliance chains');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    // Verify control exists if provided
    if (data.controlId) {
      const control = await prisma.control.findUnique({
        where: { id: data.controlId },
      });
      if (!control) {
        return validationError('Control not found', { field: 'controlId' });
      }
    }

    // Create compliance chain
    const createData: any = {
      organizationId: session.user.organizationId,
      requirement: data.requirement,
      chainStatus: data.chainStatus,
      evidenceIds: data.evidenceIds,
    };

    if (data.policyId) createData.policyId = data.policyId;
    if (data.controlId) createData.controlId = data.controlId;

    const chain = await prisma.complianceChain.create({
      data: createData,
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
      chain,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating compliance chain');
  }
}
