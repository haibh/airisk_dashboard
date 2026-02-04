import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import {
  generateCSV,
  generateExcel,
  streamCSV,
  ASSESSMENT_EXPORT_COLUMNS,
  generateFilename,
  getMimeType,
  ExportFormat,
} from '@/lib/export-generator';

/**
 * GET /api/export/assessments?format=csv|xlsx
 * Export Risk Assessments to CSV or Excel
 * Query params: format, status, frameworkId, aiSystemId, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as ExportFormat;
    const status = searchParams.get('status');
    const frameworkId = searchParams.get('frameworkId');
    const aiSystemId = searchParams.get('aiSystemId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Validate format
    if (!['csv', 'xlsx'].includes(format)) {
      return validationError('Invalid format. Use csv or xlsx');
    }

    // Build where clause
    const where: Prisma.RiskAssessmentWhereInput = {
      organizationId: session.user.organizationId,
    };

    if (status) {
      where.status = status as any;
    }

    if (frameworkId) {
      where.frameworkId = frameworkId;
    }

    if (aiSystemId) {
      where.aiSystemId = aiSystemId;
    }

    if (dateFrom || dateTo) {
      where.assessmentDate = {};
      if (dateFrom) {
        where.assessmentDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.assessmentDate.lte = new Date(dateTo);
      }
    }

    // Check if dataset is large (> 1000 records) to decide on streaming
    const totalCount = await prisma.riskAssessment.count({ where });
    const shouldStream = totalCount > 1000;

    if (shouldStream && format === 'csv') {
      // Stream CSV for large datasets
      async function* fetchData() {
        const batchSize = 500;
        let skip = 0;

        while (skip < totalCount) {
          const batch = await prisma.riskAssessment.findMany({
            where,
            include: {
              aiSystem: {
                select: {
                  id: true,
                  name: true,
                },
              },
              framework: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { assessmentDate: 'desc' },
            skip,
            take: batchSize,
          });

          for (const item of batch) {
            yield item;
          }

          skip += batchSize;
        }
      }

      const stream = streamCSV(fetchData(), ASSESSMENT_EXPORT_COLUMNS);

      return new Response(stream, {
        headers: {
          'Content-Type': getMimeType(format),
          'Content-Disposition': `attachment; filename="${generateFilename('assessments', format)}"`,
        },
      });
    }

    // Fetch all data for non-streaming export
    const assessments = await prisma.riskAssessment.findMany({
      where,
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
          },
        },
        framework: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { assessmentDate: 'desc' },
    });

    // Generate export file
    let content: string | Buffer;
    let mimeType: string;

    if (format === 'csv') {
      content = await generateCSV(assessments, ASSESSMENT_EXPORT_COLUMNS);
      mimeType = getMimeType('csv');
    } else {
      content = await generateExcel(assessments, ASSESSMENT_EXPORT_COLUMNS, 'Risk Assessments');
      mimeType = getMimeType('xlsx');
    }

    const filename = generateFilename('assessments', format);

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
    return handleApiError(error, 'exporting assessments');
  }
}
