import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import {
  generateCSV,
  generateExcel,
  streamCSV,
  AI_SYSTEM_EXPORT_COLUMNS,
  generateFilename,
  getMimeType,
  ExportFormat,
} from '@/lib/export-generator';

/**
 * GET /api/export/ai-systems?format=csv|xlsx
 * Export AI Systems to CSV or Excel
 * Query params: format, status, classification, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as ExportFormat;
    const systemType = searchParams.get('systemType');
    const lifecycleStatus = searchParams.get('lifecycleStatus');
    const riskTier = searchParams.get('riskTier');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Validate format
    if (!['csv', 'xlsx'].includes(format)) {
      return validationError('Invalid format. Use csv or xlsx');
    }

    // Build where clause
    const where: Prisma.AISystemWhereInput = {
      organizationId: session.user.organizationId,
    };

    if (systemType) {
      where.systemType = systemType as any;
    }

    if (lifecycleStatus) {
      where.lifecycleStatus = lifecycleStatus as any;
    }

    if (riskTier) {
      where.riskTier = riskTier as any;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Check if dataset is large (> 1000 records) to decide on streaming
    const totalCount = await prisma.aISystem.count({ where });
    const shouldStream = totalCount > 1000;

    if (shouldStream && format === 'csv') {
      // Stream CSV for large datasets
      async function* fetchData() {
        const batchSize = 500;
        let skip = 0;

        while (skip < totalCount) {
          const batch = await prisma.aISystem.findMany({
            where,
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: batchSize,
          });

          for (const item of batch) {
            yield item;
          }

          skip += batchSize;
        }
      }

      const stream = streamCSV(fetchData(), AI_SYSTEM_EXPORT_COLUMNS);

      return new Response(stream, {
        headers: {
          'Content-Type': getMimeType(format),
          'Content-Disposition': `attachment; filename="${generateFilename('ai-systems', format)}"`,
        },
      });
    }

    // Fetch all data for non-streaming export
    const systems = await prisma.aISystem.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate export file
    let content: string | Buffer;
    let mimeType: string;

    if (format === 'csv') {
      content = await generateCSV(systems, AI_SYSTEM_EXPORT_COLUMNS);
      mimeType = getMimeType('csv');
    } else {
      content = await generateExcel(systems, AI_SYSTEM_EXPORT_COLUMNS, 'AI Systems');
      mimeType = getMimeType('xlsx');
    }

    const filename = generateFilename('ai-systems', format);

    // Convert to proper body type for Response
    const bodyContent = typeof content === 'string' ? content : new Uint8Array(content);

    return new Response(bodyContent, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(
          typeof content === 'string' ? Buffer.byteLength(content) : content.length
        ),
      },
    });
  } catch (error) {
    return handleApiError(error, 'exporting AI systems');
  }
}
