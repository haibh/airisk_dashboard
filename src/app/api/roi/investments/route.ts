/**
 * GET /api/roi/investments - List mitigation investments
 * POST /api/roi/investments - Create mitigation investment
 * Requires: RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
} from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';

// Validation schema for POST
const createInvestmentSchema = z.object({
  controlId: z.string().min(1, 'Control ID is required'),
  implementationCost: z.number().min(0, 'Implementation cost must be non-negative'),
  annualMaintenanceCost: z.number().min(0, 'Annual maintenance cost must be non-negative'),
  mitigationPercent: z.number().min(0).max(100, 'Mitigation percent must be between 0 and 100'),
  deploymentDate: z.string().datetime(),
});

type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const controlId = searchParams.get('controlId');

    // Build where clause (controls are global, no org filter needed)
    const where: any = {};

    if (controlId) {
      where.controlId = controlId;
    }

    const investments = await prisma.mitigationInvestment.findMany({
      where,
      include: {
        control: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      investments,
      total: investments.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching mitigation investments');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Require RISK_MANAGER+ role
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const parseResult = createInvestmentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      controlId,
      implementationCost,
      annualMaintenanceCost,
      mitigationPercent,
      deploymentDate,
    } = parseResult.data;

    // Verify control exists (controls are global, no org check needed)
    const control = await prisma.control.findUnique({
      where: {
        id: controlId,
      },
    });

    if (!control) {
      return NextResponse.json(
        {
          error: 'Control not found',
        },
        { status: 404 }
      );
    }

    // Create investment record
    const investment = await prisma.mitigationInvestment.create({
      data: {
        controlId,
        implementationCost,
        annualMaintenanceCost,
        mitigationPercent,
        deploymentDate: new Date(deploymentDate),
      },
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

    return NextResponse.json(
      {
        investment,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'creating mitigation investment');
  }
}
