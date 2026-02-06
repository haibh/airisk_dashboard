/**
 * GET /api/roi/cost-profiles - List risk cost profiles
 * POST /api/roi/cost-profiles - Create/update risk cost profile
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
import { calculateALE } from '@/lib/roi-rosi-calculator';

// Validation schema for POST
const createCostProfileSchema = z.object({
  riskId: z.string().min(1, 'Risk ID is required'),
  sle: z.number().min(0, 'SLE must be non-negative'),
  aro: z.number().min(0).max(1, 'ARO must be between 0 and 1'),
});

type CreateCostProfileInput = z.infer<typeof createCostProfileSchema>;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const riskId = searchParams.get('riskId');

    // Get risks for the organization (via assessment)
    const risks = await prisma.risk.findMany({
      where: {
        assessment: {
          organizationId: session.user.organizationId,
        },
        ...(riskId ? { id: riskId } : {}),
      },
      select: {
        id: true,
      },
    });

    const riskIdsList = risks.map((r) => r.id);

    const costProfiles = await prisma.riskCostProfile.findMany({
      where: {
        riskId: { in: riskIdsList },
      },
      include: {
        risk: {
          select: {
            id: true,
            title: true,
            likelihood: true,
            impact: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate ALE for each profile
    const profilesWithALE = costProfiles.map((profile) => ({
      id: profile.id,
      riskId: profile.riskId,
      risk: profile.risk,
      sle: profile.sle,
      aro: profile.aro,
      ale: calculateALE(profile.sle, profile.aro),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }));

    return NextResponse.json({
      profiles: profilesWithALE,
      total: profilesWithALE.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching cost profiles');
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
    const parseResult = createCostProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { riskId, sle, aro } = parseResult.data;

    // Verify risk belongs to user's organization (via assessment)
    const risk = await prisma.risk.findUnique({
      where: {
        id: riskId,
      },
      include: {
        assessment: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!risk || risk.assessment.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        {
          error: 'Risk not found or access denied',
        },
        { status: 404 }
      );
    }

    if (!risk) {
      return NextResponse.json(
        {
          error: 'Risk not found or access denied',
        },
        { status: 404 }
      );
    }

    // Calculate ALE
    const ale = calculateALE(sle, aro);

    // Upsert cost profile (update if exists, create if not)
    const costProfile = await prisma.riskCostProfile.upsert({
      where: {
        riskId,
      },
      update: {
        sle,
        aro,
        ale,
      },
      create: {
        riskId,
        sle,
        aro,
        ale,
      },
      include: {
        risk: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        profile: {
          id: costProfile.id,
          riskId: costProfile.riskId,
          risk: costProfile.risk,
          sle: costProfile.sle,
          aro: costProfile.aro,
          ale: costProfile.ale,
          createdAt: costProfile.createdAt,
          updatedAt: costProfile.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'creating/updating cost profile');
  }
}
