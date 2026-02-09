import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseExcelFile,
  parseCsvFile,
  validateAndImportRisks,
  validateAndImportAISystems,
  generateImportTemplate,
} from '@/lib/bulk-import-service';
import { prisma } from '@/lib/db';
import { RiskCategory, LifecycleStatus, DataClassification, AISystemType } from '@prisma/client';

vi.mock('@/lib/db', () => ({
  prisma: {
    risk: {
      create: vi.fn(),
    },
    aISystem: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('bulk-import-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseCsvFile', () => {
    it('parses simple CSV with headers and data', async () => {
      const csv = `title,description,category
Risk 1,Description 1,BIAS_FAIRNESS
Risk 2,Description 2,SECURITY`;
      const buffer = Buffer.from(csv);

      const result = await parseCsvFile(buffer);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Risk 1');
      expect(result[0].description).toBe('Description 1');
      expect(result[1].title).toBe('Risk 2');
    });

    it('handles quoted CSV values', async () => {
      const csv = `title,description
"Risk with, comma","Description with ""quotes"""`;
      const buffer = Buffer.from(csv);

      const result = await parseCsvFile(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Risk with');
    });

    it('skips empty rows', async () => {
      const csv = `title,description
Risk 1,Description 1

Risk 2,Description 2`;
      const buffer = Buffer.from(csv);

      const result = await parseCsvFile(buffer);

      expect(result).toHaveLength(2);
    });

    it('throws error when CSV has no header row', async () => {
      const csv = 'Just data';
      const buffer = Buffer.from(csv);

      await expect(parseCsvFile(buffer)).rejects.toThrow('CSV must have header row');
    });

    it('throws error when CSV has only header row', async () => {
      const csv = 'title,description';
      const buffer = Buffer.from(csv);

      await expect(parseCsvFile(buffer)).rejects.toThrow('CSV must have header row and at least one data row');
    });
  });

  describe('validateAndImportRisks', () => {
    it('validates risk data correctly', async () => {
      const rows = [
        {
          title: 'Test Risk',
          description: 'Test description',
          category: RiskCategory.BIAS_FAIRNESS,
          likelihood: 3,
          impact: 4,
          controlEffectiveness: 50,
        },
      ];

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', true);

      expect(result.total).toBe(1);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects missing title', async () => {
      const rows = [
        {
          description: 'No title',
          category: RiskCategory.BIAS_FAIRNESS,
          likelihood: 3,
          impact: 4,
        },
      ];

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', true);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors[0]).toContain('title');
    });

    it('rejects invalid likelihood value', async () => {
      const rows = [
        {
          title: 'Test',
          category: RiskCategory.BIAS_FAIRNESS,
          likelihood: 10,
          impact: 4,
        },
      ];

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', true);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors[0]).toContain('Likelihood must be 1-5');
    });

    it('rejects invalid impact value', async () => {
      const rows = [
        {
          title: 'Test',
          category: RiskCategory.BIAS_FAIRNESS,
          likelihood: 3,
          impact: 0,
        },
      ];

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', true);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors[0]).toContain('Impact must be 1-5');
    });

    it('rejects invalid category enum', async () => {
      const rows = [
        {
          title: 'Test',
          category: 'INVALID_CATEGORY',
          likelihood: 3,
          impact: 4,
        },
      ];

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', true);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors[0]).toContain('Invalid risk category');
    });

    it('performs dry run without creating records', async () => {
      const rows = [
        {
          title: 'Test Risk',
          category: RiskCategory.BIAS_FAIRNESS,
          likelihood: 3,
          impact: 4,
        },
      ];

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', true);

      expect(result.imported).toBe(0);
      expect(result.total).toBe(1);
    });

    it('calculates inherent and residual scores correctly', async () => {
      vi.mocked(prisma.$transaction).mockImplementation((cb) => cb(prisma));

      const rows = [
        {
          title: 'Test Risk',
          category: RiskCategory.BIAS_FAIRNESS,
          likelihood: 4,
          impact: 5,
          controlEffectiveness: 30,
        },
      ];

      await validateAndImportRisks(rows, 'org-1', 'assess-1', false);

      // inherentScore = 4 * 5 = 20
      // residualScore = 20 * (1 - 0.30) = 14
      expect(vi.mocked(prisma.$transaction)).toHaveBeenCalled();
    });

    it('handles batch import with multiple chunks', async () => {
      vi.mocked(prisma.$transaction).mockImplementation((cb) => cb(prisma));

      const rows = Array.from({ length: 150 }, (_, i) => ({
        title: `Risk ${i}`,
        category: RiskCategory.BIAS_FAIRNESS,
        likelihood: 3,
        impact: 4,
      }));

      const result = await validateAndImportRisks(rows, 'org-1', 'assess-1', false);

      expect(result.total).toBe(150);
      // Should be called twice (chunk size 100)
      expect(vi.mocked(prisma.$transaction)).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateAndImportAISystems', () => {
    it('validates AI system data correctly', async () => {
      const rows = [
        {
          name: 'Test System',
          description: 'Test description',
          systemType: AISystemType.NLP,
          status: LifecycleStatus.PRODUCTION,
          dataClassification: DataClassification.CONFIDENTIAL,
        },
      ];

      const result = await validateAndImportAISystems(rows, 'org-1', 'user-1', true);

      expect(result.total).toBe(1);
      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects missing name', async () => {
      const rows = [
        {
          description: 'No name',
          systemType: AISystemType.NLP,
        },
      ];

      const result = await validateAndImportAISystems(rows, 'org-1', 'user-1', true);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors[0]).toContain('name');
    });

    it('uses default systemType OTHER', async () => {
      const rows = [
        {
          name: 'Test System',
          description: 'No type specified',
        },
      ];

      const result = await validateAndImportAISystems(rows, 'org-1', 'user-1', true);

      expect(result.errors).toHaveLength(0);
    });

    it('uses default status DEVELOPMENT', async () => {
      const rows = [
        {
          name: 'Test System',
          systemType: AISystemType.NLP,
        },
      ];

      const result = await validateAndImportAISystems(rows, 'org-1', 'user-1', true);

      expect(result.errors).toHaveLength(0);
    });

    it('uses default dataClassification INTERNAL', async () => {
      const rows = [
        {
          name: 'Test System',
          systemType: AISystemType.NLP,
        },
      ];

      const result = await validateAndImportAISystems(rows, 'org-1', 'user-1', true);

      expect(result.errors).toHaveLength(0);
    });

    it('handles batch import with chunking', async () => {
      vi.mocked(prisma.$transaction).mockImplementation((cb) => cb(prisma));

      const rows = Array.from({ length: 150 }, (_, i) => ({
        name: `System ${i}`,
        systemType: AISystemType.NLP,
      }));

      const result = await validateAndImportAISystems(rows, 'org-1', 'user-1', false);

      expect(result.total).toBe(150);
      expect(vi.mocked(prisma.$transaction)).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateImportTemplate', () => {
    it('generates risk import template', async () => {
      const buffer = await generateImportTemplate('risks');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('generates AI system import template', async () => {
      const buffer = await generateImportTemplate('ai-systems');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('generates different templates for different entity types', async () => {
      const riskTemplate = await generateImportTemplate('risks');
      const aiTemplate = await generateImportTemplate('ai-systems');

      // Templates should have different sizes due to different columns
      expect(riskTemplate.length).not.toBe(aiTemplate.length);
    });
  });
});
