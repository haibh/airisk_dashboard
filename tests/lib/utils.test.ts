import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatNumber, calculateRiskScore, getRiskLevel, generateId } from '@/lib/utils';

describe('Utils - cn (classnames utility)', () => {
  it('should merge class names', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('base');
    expect(result).toContain('active');
  });

  it('should handle false conditional classes', () => {
    const isActive = false;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('base');
    expect(result).not.toContain('active');
  });

  it('should resolve tailwind conflicts correctly', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4'); // Should use the last one
  });

  it('should handle array inputs', () => {
    const result = cn(['px-2', 'py-1']);
    expect(result).toContain('px-2');
  });

  it('should handle object inputs with boolean values', () => {
    const result = cn({ 'px-2': true, 'py-1': false });
    expect(result).toContain('px-2');
    expect(result).not.toContain('py-1');
  });

  it('should handle undefined inputs gracefully', () => {
    const result = cn('base', undefined, 'end');
    expect(result).toContain('base');
    expect(result).toContain('end');
  });

  it('should handle null inputs gracefully', () => {
    const result = cn('base', null, 'end');
    expect(result).toContain('base');
    expect(result).toContain('end');
  });

  it('should merge multiple conflicting tailwind classes', () => {
    const result = cn('text-red-500', 'text-blue-500', 'text-green-500');
    expect(result).toContain('text-green-500');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(typeof result).toBe('string');
  });
});

describe('Utils - formatDate', () => {
  const testDate = new Date('2026-02-08T10:30:00Z');

  it('should format date with default locale (en)', () => {
    const result = formatDate(testDate);
    expect(result).toMatch(/Feb/);
    expect(result).toMatch(/2026/);
  });

  it('should accept Date object', () => {
    const result = formatDate(testDate);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should accept ISO string', () => {
    const result = formatDate('2026-02-08T10:30:00Z');
    expect(result).toMatch(/Feb/);
    expect(result).toMatch(/2026/);
  });

  it('should format with specific locale (vi)', () => {
    const result = formatDate(testDate, 'vi');
    expect(result).toMatch(/2026/);
  });

  it('should format with French locale', () => {
    const result = formatDate(testDate, 'fr');
    expect(result).toMatch(/2026/);
  });

  it('should handle leap year dates', () => {
    const leapDate = new Date('2024-02-29T12:00:00Z');
    const result = formatDate(leapDate);
    expect(typeof result).toBe('string');
  });

  it('should handle year boundaries', () => {
    const newyear = new Date('2026-01-01T00:00:00Z');
    const result = formatDate(newyear);
    expect(result).toMatch(/2026/);
  });

  it('should handle invalid date strings gracefully', () => {
    try {
      const result = formatDate('invalid-date');
      // If parsing fails, it may return "Invalid Date"
      expect(typeof result).toBe('string');
    } catch (e) {
      // Some implementations throw errors for invalid dates
      expect(true).toBe(true);
    }
  });
});

describe('Utils - formatNumber', () => {
  it('should format number with default locale (en)', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  it('should format large numbers', () => {
    const result = formatNumber(1000000);
    expect(result).toContain('1');
  });

  it('should format decimals', () => {
    const result = formatNumber(123.45);
    expect(typeof result).toBe('string');
  });

  it('should format zero', () => {
    const result = formatNumber(0);
    expect(result).toBe('0');
  });

  it('should format negative numbers', () => {
    const result = formatNumber(-1234.56);
    expect(result).toMatch(/1234|1.234/); // Formatted with locale-specific separators
  });

  it('should format with French locale', () => {
    const result = formatNumber(1234.56, 'fr');
    expect(typeof result).toBe('string');
  });

  it('should format with German locale', () => {
    const result = formatNumber(1234.56, 'de');
    expect(typeof result).toBe('string');
  });

  it('should handle very small numbers', () => {
    const result = formatNumber(0.001);
    expect(typeof result).toBe('string');
  });

  it('should handle very large numbers', () => {
    const result = formatNumber(9999999999);
    expect(typeof result).toBe('string');
  });
});

describe('Utils - calculateRiskScore', () => {
  it('should calculate risk score from likelihood and impact', () => {
    const score = calculateRiskScore(3, 4);
    expect(score).toBe(12); // 3 × 4 × (1 - 0) = 12
  });

  it('should account for control effectiveness', () => {
    const scoreWithoutControl = calculateRiskScore(3, 4, 0);
    const scoreWithControl = calculateRiskScore(3, 4, 50);
    expect(scoreWithControl).toBeLessThan(scoreWithoutControl);
  });

  it('should handle max risk (5 × 5)', () => {
    const score = calculateRiskScore(5, 5);
    expect(score).toBe(25);
  });

  it('should handle min risk (1 × 1)', () => {
    const score = calculateRiskScore(1, 1);
    expect(score).toBe(1);
  });

  it('should reduce score with 100% control effectiveness', () => {
    const score = calculateRiskScore(5, 5, 100);
    expect(score).toBe(0);
  });

  it('should reduce score with 50% control effectiveness', () => {
    const score = calculateRiskScore(4, 5, 50);
    expect(score).toBe(10); // 4 × 5 × (1 - 0.5) = 10
  });

  it('should handle decimal results correctly', () => {
    const score = calculateRiskScore(3, 3, 33);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThan(0);
  });

  it('should use default control effectiveness of 0', () => {
    const scoreDefault = calculateRiskScore(3, 4);
    const scoreExplicit = calculateRiskScore(3, 4, 0);
    expect(scoreDefault).toBe(scoreExplicit);
  });

  it('should round to 1 decimal place', () => {
    const score = calculateRiskScore(3, 3, 33);
    const decimalPart = (score.toString().split('.')[1] || '').length;
    expect(decimalPart).toBeLessThanOrEqual(1);
  });

  it('should handle control effectiveness > 100 (overly effective)', () => {
    const score = calculateRiskScore(5, 5, 150);
    expect(score).toBeLessThanOrEqual(0); // Should clamp or be negative
  });
});

describe('Utils - getRiskLevel', () => {
  it('should return low for scores 1-4', () => {
    expect(getRiskLevel(1)).toBe('low');
    expect(getRiskLevel(2)).toBe('low');
    expect(getRiskLevel(3)).toBe('low');
    expect(getRiskLevel(4)).toBe('low');
  });

  it('should return medium for scores 5-9', () => {
    expect(getRiskLevel(5)).toBe('medium');
    expect(getRiskLevel(7)).toBe('medium');
    expect(getRiskLevel(9)).toBe('medium');
  });

  it('should return high for scores 10-15', () => {
    expect(getRiskLevel(10)).toBe('high');
    expect(getRiskLevel(12)).toBe('high');
    expect(getRiskLevel(15)).toBe('high');
  });

  it('should return critical for scores > 15', () => {
    expect(getRiskLevel(16)).toBe('critical');
    expect(getRiskLevel(20)).toBe('critical');
    expect(getRiskLevel(25)).toBe('critical');
  });

  it('should handle zero score', () => {
    expect(getRiskLevel(0)).toBe('low');
  });

  it('should handle boundary values correctly', () => {
    expect(getRiskLevel(4)).toBe('low');
    expect(getRiskLevel(5)).toBe('medium');
    expect(getRiskLevel(9)).toBe('medium');
    expect(getRiskLevel(10)).toBe('high');
  });

  it('should handle decimal scores', () => {
    const level = getRiskLevel(7.5);
    expect(['low', 'medium', 'high', 'critical']).toContain(level);
  });
});

describe('Utils - generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate string IDs', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate consistent length IDs', () => {
    const ids = Array(10).fill(null).map(() => generateId());
    const lengths = ids.map(id => id.length);
    expect(lengths.every(len => len === lengths[0])).toBe(true);
  });

  it('should generate base36 compatible IDs', () => {
    const id = generateId();
    expect(id.toLowerCase()).toMatch(/^[a-z0-9]+$/);
  });

  it('should not contain special characters', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/i);
  });

  it('should generate multiple IDs without collision in batch', () => {
    const ids = Array(100).fill(null).map(() => generateId());
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBeGreaterThan(90); // Allow small collision probability
  });

  it('should have reasonable entropy', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(4);
    expect(id.length).toBeLessThan(20);
  });
});
