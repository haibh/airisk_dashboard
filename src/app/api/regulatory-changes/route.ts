import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createRegulatoryChangeSchema = z.object({
  source: z.string().min(1).max(100),
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  effectiveDate: z.string().datetime(),
  status: z.enum(['PROPOSED', 'ENACTED', 'ACTIVE', 'SUPERSEDED']),
  changeType: z.string().max(100),
  frameworkIds: z.array(z.string()).optional().default([]),
  affectedControlIds: z.array(z.string()).optional().default([]),
});

const regulatoryFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['PROPOSED', 'ENACTED', 'ACTIVE', 'SUPERSEDED']).optional(),
  source: z.string().optional(),
  frameworkId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    const validation = regulatoryFilterSchema.safeParse(params);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { page, pageSize, search, status, source, frameworkId, dateFrom, dateTo } = validation.data;
    const skip = (page - 1) * pageSize;

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(source && { source }),
      ...(frameworkId && {
        affectedFrameworks: { some: { frameworkId } },
      }),
      ...(dateFrom && { effectiveDate: { gte: new Date(dateFrom) } }),
      ...(dateTo && {
        effectiveDate: dateFrom
          ? { gte: new Date(dateFrom), lte: new Date(dateTo) }
          : { lte: new Date(dateTo) }
      }),
    };

    const [changes, total] = await Promise.all([
      prisma.regulatoryChange.findMany({
        where,
        include: {
          affectedFrameworks: {
            include: { framework: { select: { shortName: true, name: true } } },
          },
          impactAssessments: {
            where: { organizationId: session.user.organizationId },
            select: { impactLevel: true, actionRequired: true, acknowledgedAt: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { effectiveDate: 'desc' },
      }),
      prisma.regulatoryChange.count({ where }),
    ]);

    return NextResponse.json({ changes, total, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'fetching regulatory changes');
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
    const validation = createRegulatoryChangeSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { frameworkIds, affectedControlIds, effectiveDate, ...data } = validation.data;

    const change = await prisma.regulatoryChange.create({
      data: {
        ...data,
        effectiveDate: new Date(effectiveDate),
        impactScore: 0,
        affectedFrameworks: {
          create: frameworkIds.map(fid => ({
            frameworkId: fid,
            affectedControls: affectedControlIds,
          })),
        },
      },
      include: {
        affectedFrameworks: {
          include: { framework: { select: { shortName: true } } },
        },
      },
    });

    return NextResponse.json(change, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating regulatory change');
  }
}
