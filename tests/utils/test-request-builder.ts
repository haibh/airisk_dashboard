/**
 * Utilities for building and testing Next.js API requests
 */
import { NextRequest } from 'next/server';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string | string[]>;
}

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  path: string,
  options: RequestOptions = {}
): NextRequest {
  const { method = 'GET', headers = {}, body = null, query = {} } = options;

  // Build query string
  const queryString = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => queryString.append(key, v));
    } else {
      queryString.set(key, value);
    }
  });

  const url = `http://localhost:3000${path}?${queryString.toString()}`;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Extract and parse response body
 */
export async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  if (contentType?.includes('text/csv')) {
    return response.text();
  }

  return response.text();
}

/**
 * Common request helper functions
 */
export const testRequests = {
  getStats: () => createMockRequest('/api/dashboard/stats'),
  getRiskHeatmap: () => createMockRequest('/api/dashboard/risk-heatmap'),
  getCompliance: (frameworkId?: string) =>
    createMockRequest('/api/dashboard/compliance', {
      query: { ...(frameworkId && { frameworkId }) },
    }),
  getActivity: () => createMockRequest('/api/dashboard/activity'),
  getAssessmentSummary: (assessmentId: string, format: 'json' | 'csv' = 'json') =>
    createMockRequest('/api/reports/assessment-summary', {
      query: { assessmentId, format },
    }),
  getComplianceReport: (frameworkId?: string, format: 'json' | 'csv' = 'json') =>
    createMockRequest('/api/reports/compliance', {
      query: { ...(frameworkId && { frameworkId }), format },
    }),
  getRiskRegisterReport: (
    status?: string,
    category?: string,
    minScore?: string,
    format: 'json' | 'csv' = 'json'
  ) =>
    createMockRequest('/api/reports/risk-register', {
      query: {
        format,
        ...(status && { status }),
        ...(category && { category }),
        ...(minScore && { minScore }),
      },
    }),
};
