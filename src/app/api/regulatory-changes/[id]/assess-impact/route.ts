import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { calculateRegulatoryImpact } from '@/lib/regulatory-impact-calculator';
import { z } from 'zod';

const assessImpactSchema = z.object({
  assignedTo: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json().catch(() => ({}));
    const validation = assessImpactSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { id } = await params;

    const change = await prisma.regulatoryChange.findUnique({
      where: { id },
      include: { affectedFrameworks: true },
    });

    if (!change) return notFoundError('Regulatory change');

    const impact = await calculateRegulatoryImpact(
      id,
      session.user.organizationId
    );

    // Check if impact assessment already exists
    const existingImpact = await prisma.changeImpact.findFirst({
      where: {
        changeId: id,
        organizationId: session.user.organizationId,
      },
    });

    const assessment = existingImpact
      ? await prisma.changeImpact.update({
          where: { id: existingImpact.id },
          data: {
            impactLevel: impact.level,
            actionRequired: impact.actionRequired,
            dueDate: impact.dueDate,
            assignedTo: validation.data.assignedTo,
          },
        })
      : await prisma.changeImpact.create({
          data: {
            changeId: id,
            organizationId: session.user.organizationId,
            impactLevel: impact.level,
            actionRequired: impact.actionRequired,
            dueDate: impact.dueDate,
            assignedTo: validation.data.assignedTo,
          },
        });

    return NextResponse.json({ assessment, impact });
  } catch (error) {
    return handleApiError(error, 'assessing regulatory impact');
  }
}
