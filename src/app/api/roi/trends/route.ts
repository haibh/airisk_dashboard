/**
 * GET /api/roi/trends
 * Historical ROSI calculations for the organization
 * Requires: VIEWER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
} from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 12;

    // Get historical ROSI calculations
    const calculations = await prisma.rOSICalculation.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        calculationDate: 'desc',
      },
      take: limit,
      select: {
        id: true,
        calculationDate: true,
        totalALE: true,
        totalInvestment: true,
        totalMitigation: true,
        rosi: true,
        paybackPeriod: true,
      },
    });

    // Reverse to show chronological order (oldest to newest)
    const trends = calculations.reverse().map((calc) => ({
      date: calc.calculationDate.toISOString().split('T')[0], // YYYY-MM-DD
      rosi: calc.rosi * 100, // Return as percentage
      totalALE: calc.totalALE,
      totalInvestment: calc.totalInvestment,
      totalMitigation: calc.totalMitigation,
      paybackPeriod: calc.paybackPeriod,
    }));

    return NextResponse.json({
      trends,
      dataPoints: trends.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching ROI trends');
  }
}
