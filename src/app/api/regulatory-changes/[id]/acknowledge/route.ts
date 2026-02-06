import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await params;

    // Find the impact assessment for this org
    const impact = await prisma.changeImpact.findFirst({
      where: {
        changeId: id,
        organizationId: session.user.organizationId,
      },
    });

    if (!impact) {
      return notFoundError('Impact assessment not found. Please assess impact first.');
    }

    // Update acknowledgedAt timestamp
    const updated = await prisma.changeImpact.update({
      where: { id: impact.id },
      data: {
        acknowledgedAt: new Date(),
      },
      include: {
        change: {
          select: { title: true, effectiveDate: true, status: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, 'acknowledging regulatory change');
  }
}
