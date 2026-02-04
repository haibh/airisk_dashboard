/**
 * Evidence API Endpoint Tests
 * Tests for /api/evidence and /api/evidence/[id] routes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as listEvidence, POST as uploadEvidence } from '@/app/api/evidence/route';
import { GET as getEvidence, PUT as updateEvidence, DELETE as deleteEvidence } from '@/app/api/evidence/[id]/route';
import { POST as approveEvidence } from '@/app/api/evidence/[id]/approve/route';
import { GET as downloadEvidence } from '@/app/api/evidence/[id]/download/route';
import { prismaMock } from '../setup';
import * as authHelpers from '@/lib/auth-helpers';
import * as storageService from '@/lib/storage-service';

// Mock NextAuth session
const mockSession = {
  user: {
    id: 'user-1',
    email: 'assessor@example.com',
    name: 'Test Assessor',
    role: 'ASSESSOR',
    organizationId: 'org-1',
  },
  expires: '2025-12-31',
};

// Mock evidence data
const mockEvidence = {
  id: 'evidence-1',
  filename: 'policy_doc.pdf',
  originalName: 'Policy Document.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024000,
  storagePath: 'evidence/org-1/1234567890_policy_doc.pdf',
  hashSha256: 'abc123def456',
  description: 'Privacy policy documentation',
  reviewStatus: 'SUBMITTED' as const,
  validUntil: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  organizationId: 'org-1',
  uploadedById: 'user-1',
  uploadedBy: {
    id: 'user-1',
    name: 'Test Assessor',
    email: 'assessor@example.com',
  },
  links: [],
};

describe('Evidence API - List and Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue(mockSession);
    vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(true);
  });

  describe('GET /api/evidence', () => {
    it('should return paginated evidence list', async () => {
      prismaMock.evidence.count.mockResolvedValue(1);
      prismaMock.evidence.findMany.mockResolvedValue([mockEvidence as any]);

      const url = new URL('http://localhost:3000/api/evidence?page=1&pageSize=10');
      const request = new Request(url);

      const response = await listEvidence(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(prismaMock.evidence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-1',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      prismaMock.evidence.count.mockResolvedValue(1);
      prismaMock.evidence.findMany.mockResolvedValue([mockEvidence as any]);

      const url = new URL('http://localhost:3000/api/evidence?status=APPROVED');
      const request = new Request(url);

      await listEvidence(request as any);

      expect(prismaMock.evidence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reviewStatus: 'APPROVED',
          }),
        })
      );
    });

    it('should require ASSESSOR+ role', async () => {
      vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: 'VIEWER' },
      });
      vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(false);

      const url = new URL('http://localhost:3000/api/evidence');
      const request = new Request(url);

      const response = await listEvidence(request as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Assessors');
    });
  });

  describe('POST /api/evidence', () => {
    beforeEach(() => {
      vi.spyOn(storageService, 'validateFile').mockReturnValue({ valid: true });
      vi.spyOn(storageService, 'calculateSha256').mockReturnValue('abc123def456');
      vi.spyOn(storageService, 'uploadFile').mockResolvedValue('evidence/org-1/test.pdf');
    });

    it('should upload evidence successfully', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(null); // No duplicate
      prismaMock.evidence.create.mockResolvedValue(mockEvidence as any);

      // Create mock file
      const fileContent = new Uint8Array([1, 2, 3, 4]);
      const file = new File([fileContent], 'test.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', 'Test document');

      const request = new Request('http://localhost:3000/api/evidence', {
        method: 'POST',
        body: formData,
      });

      const response = await uploadEvidence(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('uploaded successfully');
      expect(prismaMock.evidence.create).toHaveBeenCalled();
    });

    it('should reject duplicate file hash', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);

      const fileContent = new Uint8Array([1, 2, 3, 4]);
      const file = new File([fileContent], 'test.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);

      const request = new Request('http://localhost:3000/api/evidence', {
        method: 'POST',
        body: formData,
      });

      const response = await uploadEvidence(request as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already been uploaded');
    });

    it('should validate file requirements', async () => {
      vi.spyOn(storageService, 'validateFile').mockReturnValue({
        valid: false,
        error: 'File too large',
      });

      const fileContent = new Uint8Array([1, 2, 3, 4]);
      const file = new File([fileContent], 'large.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);

      const request = new Request('http://localhost:3000/api/evidence', {
        method: 'POST',
        body: formData,
      });

      const response = await uploadEvidence(request as any);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toContain('too large');
    });
  });
});

describe('Evidence API - Detail Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue(mockSession);
    vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(true);
  });

  describe('GET /api/evidence/[id]', () => {
    it('should return evidence details', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1');
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await getEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('evidence-1');
    });

    it('should return 404 for non-existent evidence', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/evidence/invalid');
      const params = Promise.resolve({ id: 'invalid' });

      const response = await getEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('PUT /api/evidence/[id]', () => {
    it('should update evidence metadata', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);
      prismaMock.evidence.update.mockResolvedValue({
        ...mockEvidence,
        description: 'Updated description',
      } as any);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated description' }),
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await updateEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.evidence.update).toHaveBeenCalled();
    });

    it('should enforce ownership or admin role', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue({
        ...mockEvidence,
        uploadedById: 'other-user',
      } as any);

      vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: 'user-2', role: 'ASSESSOR' },
      });

      const request = new Request('http://localhost:3000/api/evidence/evidence-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated' }),
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await updateEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('uploader or admin');
    });
  });

  describe('DELETE /api/evidence/[id]', () => {
    it('should delete evidence', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);
      prismaMock.evidence.delete.mockResolvedValue(mockEvidence as any);
      vi.spyOn(storageService, 'deleteFile').mockResolvedValue(true);

      vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, role: 'RISK_MANAGER' },
      });

      const request = new Request('http://localhost:3000/api/evidence/evidence-1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await deleteEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.evidence.delete).toHaveBeenCalled();
      expect(storageService.deleteFile).toHaveBeenCalledWith(mockEvidence.storagePath);
    });

    it('should require RISK_MANAGER+ role', async () => {
      vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(false);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await deleteEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Risk Managers');
    });
  });
});

describe('Evidence API - Approval Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue({
      ...mockSession,
      user: { ...mockSession.user, role: 'RISK_MANAGER' },
    });
    vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(true);
  });

  describe('POST /api/evidence/[id]/approve', () => {
    it('should approve evidence', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);
      prismaMock.evidence.update.mockResolvedValue({
        ...mockEvidence,
        reviewStatus: 'APPROVED',
      } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1/approve', {
        method: 'POST',
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await approveEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.evidence.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { reviewStatus: 'APPROVED' },
        })
      );
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should reject evidence', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);
      prismaMock.evidence.update.mockResolvedValue({
        ...mockEvidence,
        reviewStatus: 'REJECTED',
      } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1/approve', {
        method: 'POST',
        body: JSON.stringify({ action: 'REJECT', reason: 'Incomplete documentation' }),
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await approveEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.evidence.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { reviewStatus: 'REJECTED' },
        })
      );
    });

    it('should validate status transitions', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue({
        ...mockEvidence,
        reviewStatus: 'APPROVED',
      } as any);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1/approve', {
        method: 'POST',
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await approveEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot transition');
    });
  });
});

describe('Evidence API - Download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue(mockSession);
    vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(true);
  });

  describe('GET /api/evidence/[id]/download', () => {
    it('should generate download URL', async () => {
      prismaMock.evidence.findFirst.mockResolvedValue(mockEvidence as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      vi.spyOn(storageService, 'getSignedUrl').mockResolvedValue('https://s3.example.com/signed-url');

      const request = new Request('http://localhost:3000/api/evidence/evidence-1/download');
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await downloadEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toBe('https://s3.example.com/signed-url');
      expect(data.data.filename).toBe(mockEvidence.originalName);
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'EVIDENCE_DOWNLOAD',
          }),
        })
      );
    });

    it('should require VIEWER+ role', async () => {
      vi.spyOn(authHelpers, 'getServerSession').mockResolvedValue({
        user: null,
        expires: '',
      });
      vi.spyOn(authHelpers, 'hasMinimumRole').mockReturnValue(false);

      const request = new Request('http://localhost:3000/api/evidence/evidence-1/download');
      const params = Promise.resolve({ id: 'evidence-1' });

      const response = await downloadEvidence(request as any, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
    });
  });
});
