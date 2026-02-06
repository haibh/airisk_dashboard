/**
 * GET /api/compliance-graph/flow-data
 * Returns React Flow formatted data for requirement→control→evidence visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { buildFlowData } from '@/lib/compliance-chain-builder';
import { z } from 'zod';

const querySchema = z.object({
  frameworkId: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);

    const frameworkId = searchParams.get('frameworkId');
    if (!frameworkId) {
      return validationError('frameworkId is required', { field: 'frameworkId' });
    }

    const query = querySchema.parse({
      frameworkId,
      limit: searchParams.get('limit') || undefined,
    });

    // Fetch compliance chains with controls
    const chains = await prisma.complianceChain.findMany({
      where: {
        organizationId: session.user.organizationId,
        control: {
          frameworkId: query.frameworkId,
        },
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
      take: query.limit,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch evidence for each chain
    const evidenceMap = new Map();
    for (const chain of chains) {
      if (chain.evidenceIds && chain.evidenceIds.length > 0) {
        const evidences = await prisma.evidence.findMany({
          where: {
            id: { in: chain.evidenceIds },
            organizationId: session.user.organizationId,
          },
          select: {
            id: true,
            filename: true,
            originalName: true,
          },
        });
        evidenceMap.set(chain.id, evidences);
      }
    }

    // Build React Flow data structure
    const flowData = buildFlowData(chains, evidenceMap);

    return NextResponse.json({
      ...flowData,
      metadata: {
        frameworkId: query.frameworkId,
        totalChains: chains.length,
        totalNodes: flowData.nodes.length,
        totalEdges: flowData.edges.length,
      },
    });
  } catch (error) {
    return handleApiError(error, 'building flow data');
  }
}
