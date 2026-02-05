import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchResult {
  entityType: 'ai_system' | 'assessment' | 'risk' | 'evidence';
  id: string;
  title: string;
  snippet: string; // Highlighted match context
  relevance: number;
  metadata: Record<string, unknown>;
}

export interface SearchOptions {
  query: string;
  entityTypes?: string[]; // Filter by entity type
  organizationId: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  queryTime: number;
}

// ============================================================================
// MAIN SEARCH FUNCTION
// ============================================================================

/**
 * Global search across multiple entity types
 */
export async function search(options: SearchOptions): Promise<SearchResponse> {
  const startTime = Date.now();
  const {
    query,
    entityTypes = ['ai_system', 'assessment', 'risk', 'evidence'],
    organizationId,
    page = 1,
    pageSize = 20,
    filters = {},
  } = options;

  // Normalize query
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return {
      results: [],
      total: 0,
      page,
      pageSize,
      queryTime: Date.now() - startTime,
    };
  }

  // Search each entity type in parallel
  const searchPromises: Promise<SearchResult[]>[] = [];

  if (entityTypes.includes('ai_system')) {
    searchPromises.push(searchAISystems(normalizedQuery, organizationId, filters));
  }
  if (entityTypes.includes('assessment')) {
    searchPromises.push(searchAssessments(normalizedQuery, organizationId, filters));
  }
  if (entityTypes.includes('risk')) {
    searchPromises.push(searchRisks(normalizedQuery, organizationId, filters));
  }
  if (entityTypes.includes('evidence')) {
    searchPromises.push(searchEvidence(normalizedQuery, organizationId, filters));
  }

  // Wait for all searches
  const searchResults = await Promise.all(searchPromises);

  // Combine and sort by relevance
  const allResults = searchResults.flat();
  allResults.sort((a, b) => b.relevance - a.relevance);

  // Paginate results
  const total = allResults.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedResults = allResults.slice(start, end);

  return {
    results: paginatedResults,
    total,
    page,
    pageSize,
    queryTime: Date.now() - startTime,
  };
}

// ============================================================================
// ENTITY-SPECIFIC SEARCH FUNCTIONS
// ============================================================================

/**
 * Search AI Systems
 */
export async function searchAISystems(
  query: string,
  orgId: string,
  filters?: Record<string, unknown>
): Promise<SearchResult[]> {
  const whereClause: Prisma.AISystemWhereInput = {
    organizationId: orgId,
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { purpose: { contains: query, mode: 'insensitive' } },
    ],
  };

  // Apply filters
  if (filters?.systemType) {
    whereClause.systemType = filters.systemType as any;
  }
  if (filters?.lifecycleStatus) {
    whereClause.lifecycleStatus = filters.lifecycleStatus as any;
  }
  if (filters?.riskTier) {
    whereClause.riskTier = filters.riskTier as any;
  }

  const systems = await prisma.aISystem.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      description: true,
      purpose: true,
      systemType: true,
      lifecycleStatus: true,
      riskTier: true,
      createdAt: true,
    },
    take: 50, // Limit to top 50 results per entity type
  });

  return systems.map((system) => {
    const relevance = calculateRelevance(query, [
      system.name,
      system.description || '',
      system.purpose || '',
    ]);

    return {
      entityType: 'ai_system' as const,
      id: system.id,
      title: system.name,
      snippet: highlightMatches(
        system.description || system.purpose || 'No description',
        query
      ),
      relevance,
      metadata: {
        systemType: system.systemType,
        lifecycleStatus: system.lifecycleStatus,
        riskTier: system.riskTier,
        createdAt: system.createdAt,
      },
    };
  });
}

/**
 * Search Risk Assessments
 */
export async function searchAssessments(
  query: string,
  orgId: string,
  filters?: Record<string, unknown>
): Promise<SearchResult[]> {
  const whereClause: Prisma.RiskAssessmentWhereInput = {
    organizationId: orgId,
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  };

  // Apply filters
  if (filters?.status) {
    whereClause.status = filters.status as any;
  }
  if (filters?.frameworkId) {
    whereClause.frameworkId = filters.frameworkId as string;
  }

  const assessments = await prisma.riskAssessment.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      assessmentDate: true,
      aiSystem: {
        select: {
          name: true,
        },
      },
      framework: {
        select: {
          name: true,
        },
      },
    },
    take: 50,
  });

  return assessments.map((assessment) => {
    const relevance = calculateRelevance(query, [
      assessment.title,
      assessment.description || '',
      assessment.aiSystem.name,
    ]);

    return {
      entityType: 'assessment' as const,
      id: assessment.id,
      title: assessment.title,
      snippet: highlightMatches(
        assessment.description || `Assessment for ${assessment.aiSystem.name}`,
        query
      ),
      relevance,
      metadata: {
        status: assessment.status,
        assessmentDate: assessment.assessmentDate,
        aiSystemName: assessment.aiSystem.name,
        frameworkName: assessment.framework.name,
      },
    };
  });
}

/**
 * Search Risks
 */
export async function searchRisks(
  query: string,
  orgId: string,
  filters?: Record<string, unknown>
): Promise<SearchResult[]> {
  const whereClause: Prisma.RiskWhereInput = {
    assessment: {
      organizationId: orgId,
    },
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { treatmentPlan: { contains: query, mode: 'insensitive' } },
    ],
  };

  // Apply filters
  if (filters?.category) {
    whereClause.category = filters.category as any;
  }
  if (filters?.treatmentStatus) {
    whereClause.treatmentStatus = filters.treatmentStatus as any;
  }
  if (filters?.minResidualScore !== undefined) {
    whereClause.residualScore = { gte: filters.minResidualScore as number };
  }

  const risks = await prisma.risk.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      residualScore: true,
      treatmentStatus: true,
      assessment: {
        select: {
          title: true,
          aiSystem: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    take: 50,
  });

  return risks.map((risk) => {
    const relevance = calculateRelevance(query, [
      risk.title,
      risk.description || '',
    ]);

    return {
      entityType: 'risk' as const,
      id: risk.id,
      title: risk.title,
      snippet: highlightMatches(
        risk.description || 'No description',
        query
      ),
      relevance,
      metadata: {
        category: risk.category,
        residualScore: risk.residualScore,
        treatmentStatus: risk.treatmentStatus,
        assessmentTitle: risk.assessment.title,
        aiSystemName: risk.assessment.aiSystem.name,
      },
    };
  });
}

/**
 * Search Evidence
 */
export async function searchEvidence(
  query: string,
  orgId: string,
  filters?: Record<string, unknown>
): Promise<SearchResult[]> {
  const whereClause: Prisma.EvidenceWhereInput = {
    organizationId: orgId,
    OR: [
      { filename: { contains: query, mode: 'insensitive' } },
      { originalName: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  };

  // Apply filters
  if (filters?.reviewStatus) {
    whereClause.reviewStatus = filters.reviewStatus as any;
  }
  if (filters?.mimeType) {
    whereClause.mimeType = { contains: filters.mimeType as string };
  }

  const evidenceItems = await prisma.evidence.findMany({
    where: whereClause,
    select: {
      id: true,
      filename: true,
      originalName: true,
      description: true,
      mimeType: true,
      fileSize: true,
      reviewStatus: true,
      createdAt: true,
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
    take: 50,
  });

  return evidenceItems.map((evidence) => {
    const relevance = calculateRelevance(query, [
      evidence.originalName,
      evidence.description || '',
    ]);

    return {
      entityType: 'evidence' as const,
      id: evidence.id,
      title: evidence.originalName,
      snippet: highlightMatches(
        evidence.description || `File: ${evidence.filename}`,
        query
      ),
      relevance,
      metadata: {
        filename: evidence.filename,
        mimeType: evidence.mimeType,
        fileSize: evidence.fileSize,
        reviewStatus: evidence.reviewStatus,
        uploadedBy: evidence.uploadedBy.name,
        createdAt: evidence.createdAt,
      },
    };
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate relevance score based on query matches
 */
function calculateRelevance(query: string, fields: string[]): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;

  fields.forEach((field, index) => {
    if (!field) return;

    const lowerField = field.toLowerCase();

    // Exact match gets highest score
    if (lowerField === lowerQuery) {
      score += 100;
    }

    // Field contains exact query
    if (lowerField.includes(lowerQuery)) {
      score += 50;
    }

    // Match individual words
    const queryWords = lowerQuery.split(/\s+/);
    queryWords.forEach((word) => {
      if (lowerField.includes(word)) {
        score += 10;
      }
    });

    // Boost score for matches in earlier fields (e.g., title)
    score *= (fields.length - index) / fields.length;
  });

  return score;
}

/**
 * Escape HTML entities to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Highlight query matches in text
 * XSS-safe: escapes HTML entities before adding highlight markup
 */
export function highlightMatches(text: string, query: string): string {
  if (!text || !query) return escapeHtml(text || '');

  // Find the first occurrence of query (case-insensitive)
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    // No match, return first 150 chars (escaped)
    const truncated = text.length > 150 ? text.substring(0, 150) + '...' : text;
    return escapeHtml(truncated);
  }

  // Extract context around match (50 chars before and after)
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + 100);

  let snippet = text.substring(start, end);

  // Add ellipsis
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  // Highlight the match (escape all parts first, then add safe markup)
  const matchStart = snippet.toLowerCase().indexOf(lowerQuery);
  if (matchStart !== -1) {
    const before = escapeHtml(snippet.substring(0, matchStart));
    const match = escapeHtml(snippet.substring(matchStart, matchStart + query.length));
    const after = escapeHtml(snippet.substring(matchStart + query.length));
    snippet = `${before}<mark>${match}</mark>${after}`;
  } else {
    snippet = escapeHtml(snippet);
  }

  return snippet;
}

/**
 * Build Prisma query for search
 */
export function buildSearchQuery(
  query: string,
  entityType: string
): Prisma.AISystemWhereInput | Prisma.RiskAssessmentWhereInput | Prisma.RiskWhereInput | Prisma.EvidenceWhereInput {
  const searchCondition = { contains: query, mode: 'insensitive' as const };

  switch (entityType) {
    case 'ai_system':
      return {
        OR: [
          { name: searchCondition },
          { description: searchCondition },
          { purpose: searchCondition },
        ],
      };
    case 'assessment':
      return {
        OR: [
          { title: searchCondition },
          { description: searchCondition },
        ],
      };
    case 'risk':
      return {
        OR: [
          { title: searchCondition },
          { description: searchCondition },
          { treatmentPlan: searchCondition },
        ],
      };
    case 'evidence':
      return {
        OR: [
          { filename: searchCondition },
          { originalName: searchCondition },
          { description: searchCondition },
        ],
      };
    default:
      return {};
  }
}
