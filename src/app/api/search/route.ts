import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { search } from '@/lib/global-search-service';

/**
 * GET /api/search
 * Global search across AI systems, assessments, risks, and evidence
 *
 * Query params:
 * - q: Search query (required)
 * - type: Entity types to search (comma-separated: ai_system,assessment,risk,evidence) (default: all)
 * - page: Page number (default: 1)
 * - pageSize: Results per page (default: 20, max: 100)
 * - filters: JSON-encoded filter object (optional)
 *
 * Requires: VIEWER+ role
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const typeParam = searchParams.get('type');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const filtersParam = searchParams.get('filters');

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
          code: 'INVALID_QUERY'
        },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query too long (max 200 characters)',
          code: 'QUERY_TOO_LONG'
        },
        { status: 400 }
      );
    }

    // Parse entity types
    let entityTypes: string[] | undefined;
    if (typeParam) {
      entityTypes = typeParam.split(',').filter((t) =>
        ['ai_system', 'assessment', 'risk', 'evidence'].includes(t)
      );

      if (entityTypes.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid entity type. Must be one of: ai_system, assessment, risk, evidence',
            code: 'INVALID_ENTITY_TYPE'
          },
          { status: 400 }
        );
      }
    }

    // Parse pagination
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
    let pageSize = pageSizeParam ? Math.max(1, parseInt(pageSizeParam, 10)) : 20;

    // Cap page size at 100
    if (pageSize > 100) {
      pageSize = 100;
    }

    // Parse filters
    let filters: Record<string, unknown> = {};
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid filters JSON format',
            code: 'INVALID_FILTERS'
          },
          { status: 400 }
        );
      }
    }

    // Perform search
    const searchResults = await search({
      query: query.trim(),
      entityTypes,
      organizationId: session.user.organizationId,
      page,
      pageSize,
      filters,
    });

    return NextResponse.json({
      success: true,
      data: searchResults.results,
      total: searchResults.total,
      page: searchResults.page,
      pageSize: searchResults.pageSize,
      queryTime: searchResults.queryTime,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during search',
        code: 'SEARCH_FAILED'
      },
      { status: 500 }
    );
  }
}
