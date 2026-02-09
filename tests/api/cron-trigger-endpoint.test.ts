import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

vi.mock('@/lib/scheduled-job-runner', () => ({
  processScheduledJobs: vi.fn().mockResolvedValue(undefined),
}));

describe('/api/cron - Cron trigger endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
  });

  describe('GET /api/cron', () => {
    it('returns 500 when CRON_SECRET not configured', async () => {
      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer some-secret' },
      });

      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('CRON_SECRET not configured');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        'CRON_SECRET not configured in environment'
      );
    });

    it('returns 401 when missing authorization header', async () => {
      process.env.CRON_SECRET = 'secret-key';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(vi.mocked(logger.warn)).toHaveBeenCalled();
    });

    it('returns 401 when authorization header is empty', async () => {
      process.env.CRON_SECRET = 'secret-key';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: '' },
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('returns 401 when authorization header has wrong format', async () => {
      process.env.CRON_SECRET = 'secret-key';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Basic secret-key' },
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('returns 401 when secret does not match', async () => {
      process.env.CRON_SECRET = 'correct-secret';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer wrong-secret' },
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized cron request attempt'),
        expect.any(Object)
      );
    });

    it('returns 200 with correct authorization header', async () => {
      process.env.CRON_SECRET = 'my-secret-key';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer my-secret-key' },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.processedAt).toBeDefined();
    });

    it('processes scheduled jobs on success', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const { processScheduledJobs } = await import('@/lib/scheduled-job-runner');

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(processScheduledJobs)).toHaveBeenCalled();
    });

    it('logs successful cron trigger', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' },
      });

      await GET(request);

      expect(vi.mocked(logger.info)).toHaveBeenCalledWith(
        expect.stringContaining('Cron trigger received')
      );
    });

    it('returns ISO timestamp in response', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.processedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('includes x-forwarded-for in unauthorized warning', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: {
          authorization: 'Bearer wrong-secret',
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized cron request'),
        expect.objectContaining({
          data: expect.objectContaining({
            ip: '192.168.1.1',
          }),
        })
      );
    });

    it('handles scheduled jobs processing failure', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const { processScheduledJobs } = await import('@/lib/scheduled-job-runner');
      vi.mocked(processScheduledJobs).mockRejectedValueOnce(
        new Error('Jobs processing failed')
      );

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' },
      });

      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Cron execution failed');
      expect(data.message).toBe('Jobs processing failed');
    });

    it('returns generic error for unknown exceptions', async () => {
      process.env.CRON_SECRET = 'test-secret';

      const { processScheduledJobs } = await import('@/lib/scheduled-job-runner');
      vi.mocked(processScheduledJobs).mockRejectedValueOnce(
        'Unknown error'
      );

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' },
      });

      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Cron execution failed');
      expect(data.message).toBe('Unknown error');
    });

    it('case-sensitive secret comparison', async () => {
      process.env.CRON_SECRET = 'TestSecret';

      const { GET } = await import('@/app/api/cron/route');
      const request = new NextRequest('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: { authorization: 'Bearer testsecret' },
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
