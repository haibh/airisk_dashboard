import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError, notFoundError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateRegulatoryChangeSchema = z.object({
  source: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  effectiveDate: z.string().datetime().optional(),
  status: z.enum(['PROPOSED', 'ENACTED', 'ACTIVE', 'SUPERSEDED']).optional(),
  changeType: z.string().max(100).optional(),
  impactScore: z.number().min(0).max(100).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { id } = await params;

    const change = await prisma.regulatoryChange.findUnique({
      where: { id },
      include: {
        affectedFrameworks: {
          include: {
            framework: {
              select: { id: true, name: true, shortName: true, version: true },
            },
          },
        },
        impactAssessments: {
          where: { organizationId: session.user.organizationId },
          include: {
            organization: { select: { name: true } },
          },
        },
      },
    });

    if (!change) return notFoundError('Regulatory change');

    return NextResponse.json(change);
  } catch (error) {
    return handleApiError(error, 'fetching regulatory change');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const validation = updateRegulatoryChangeSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { id } = await params;
    const { effectiveDate, ...data } = validation.data;

    const change = await prisma.regulatoryChange.update({
      where: { id },
      data: {
        ...data,
        ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
      },
      include: {
        affectedFrameworks: {
          include: { framework: { select: { shortName: true } } },
        },
      },
    });

    return NextResponse.json(change);
  } catch (error) {
    return handleApiError(error, 'updating regulatory change');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError();
    }

    const { id } = await params;

    await prisma.regulatoryChange.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'deleting regulatory change');
  }
}
