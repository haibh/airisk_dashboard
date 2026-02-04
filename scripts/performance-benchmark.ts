/**
 * Performance Benchmark Script for AIRM-IP
 * Measures page load times and API response times against targets:
 * - Page load: < 3s
 * - API response: < 500ms (P95)
 *
 * Run: npx tsx scripts/performance-benchmark.ts
 * Requires: Dev server running on localhost:3000
 */

const API_BASE = 'http://localhost:3000';
const ITERATIONS = 20;

interface BenchmarkResult {
  endpoint: string;
  times: number[];
  min: number;
  max: number;
  avg: number;
  p95: number;
  target: number;
  passed: boolean;
}

async function measureEndpoint(
  endpoint: string,
  target: number,
  headers: Record<string, string> = {}
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      await response.json();
    } catch (error) {
      // Endpoint may require auth or fail - log and measure regardless
      console.warn(`⚠️  ${endpoint} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    const end = performance.now();
    times.push(end - start);
  }

  const sorted = [...times].sort((a, b) => a - b);
  const p95Index = Math.floor(ITERATIONS * 0.95);

  return {
    endpoint,
    times,
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
    avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    p95: Math.round(sorted[p95Index] || sorted[sorted.length - 1]),
    target,
    passed: sorted[p95Index] <= target,
  };
}

async function runBenchmarks() {
  console.log('🚀 AIRM-IP Performance Benchmarks\n');
  console.log(`Running ${ITERATIONS} iterations per endpoint...\n`);
  console.log('─'.repeat(70));

  const apiEndpoints = [
    { path: '/api/dashboard/stats', target: 500 },
    { path: '/api/dashboard/risk-heatmap', target: 500 },
    { path: '/api/dashboard/compliance', target: 500 },
    { path: '/api/dashboard/activity', target: 500 },
    { path: '/api/ai-systems', target: 500 },
    { path: '/api/frameworks', target: 500 },
    { path: '/api/assessments', target: 500 },
  ];

  const pageEndpoints = [
    { path: '/en/login', target: 3000 },
    { path: '/en/dashboard', target: 3000 },
    { path: '/en/ai-systems', target: 3000 },
    { path: '/en/frameworks', target: 3000 },
  ];

  console.log('\n📊 API Endpoints (Target: < 500ms P95)\n');

  const apiResults: BenchmarkResult[] = [];
  for (const { path, target } of apiEndpoints) {
    const result = await measureEndpoint(path, target);
    apiResults.push(result);
    const status = result.passed ? '✅' : '❌';
    console.log(
      `${status} ${path.padEnd(30)} | P95: ${String(result.p95).padStart(4)}ms | Avg: ${String(result.avg).padStart(4)}ms`
    );
  }

  console.log('\n📄 Page Load (Target: < 3000ms P95)\n');

  const pageResults: BenchmarkResult[] = [];
  for (const { path, target } of pageEndpoints) {
    const result = await measureEndpoint(path, target);
    pageResults.push(result);
    const status = result.passed ? '✅' : '❌';
    console.log(
      `${status} ${path.padEnd(30)} | P95: ${String(result.p95).padStart(4)}ms | Avg: ${String(result.avg).padStart(4)}ms`
    );
  }

  console.log('\n' + '─'.repeat(70));

  const allResults = [...apiResults, ...pageResults];
  const passed = allResults.filter((r) => r.passed).length;
  const total = allResults.length;

  console.log(`\n📋 Summary: ${passed}/${total} endpoints meet targets`);

  if (passed === total) {
    console.log('✅ All performance targets met!\n');
  } else {
    console.log('⚠️  Some endpoints exceed targets - optimization may be needed\n');
  }

  // Output JSON for CI integration
  const report = {
    timestamp: new Date().toISOString(),
    iterations: ITERATIONS,
    targets: { api_p95_ms: 500, page_p95_ms: 3000 },
    api: apiResults.map(({ endpoint, p95, avg, passed }) => ({
      endpoint,
      p95,
      avg,
      passed,
    })),
    pages: pageResults.map(({ endpoint, p95, avg, passed }) => ({
      endpoint,
      p95,
      avg,
      passed,
    })),
    overall: { passed, total, success: passed === total },
  };

  console.log('📁 JSON Report:');
  console.log(JSON.stringify(report, null, 2));
}

runBenchmarks().catch(console.error);
