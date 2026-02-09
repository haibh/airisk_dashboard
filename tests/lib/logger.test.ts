import { describe, it, expect, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Logger is a simple module that outputs to console
    // We just test that it exists and can be called
    expect(logger).toBeDefined();
  });

  describe('Logger Methods', () => {
    it('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });

    it('should allow calling info with message only', () => {
      expect(() => logger.info('Test message')).not.toThrow();
    });

    it('should allow calling error with message only', () => {
      expect(() => logger.error('Error message')).not.toThrow();
    });

    it('should allow calling warn with message only', () => {
      expect(() => logger.warn('Warning message')).not.toThrow();
    });

    it('should allow calling debug with message only', () => {
      expect(() => logger.debug('Debug message')).not.toThrow();
    });

    it('should allow calling info with message and context', () => {
      expect(() => logger.info('Message', { key: 'value' })).not.toThrow();
    });

    it('should allow calling error with message and context', () => {
      expect(() => logger.error('Error', { code: 500 })).not.toThrow();
    });

    it('should allow calling error with Error object', () => {
      const error = new Error('Test error');
      expect(() => logger.error('Error occurred', error)).not.toThrow();
    });

    it('should allow calling warn with message and context', () => {
      expect(() => logger.warn('Warning', { deprecated: true })).not.toThrow();
    });

    it('should allow calling debug with message and context', () => {
      expect(() => logger.debug('Debug info', { trace: true })).not.toThrow();
    });

    it('should handle empty message', () => {
      expect(() => logger.info('')).not.toThrow();
    });

    it('should handle null context', () => {
      expect(() => logger.info('Message', null)).not.toThrow();
    });

    it('should handle undefined context', () => {
      expect(() => logger.info('Message', undefined)).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      expect(() => logger.info(longMessage)).not.toThrow();
    });

    it('should handle complex nested context objects', () => {
      expect(() => logger.info('Message', {
        user: { id: '123', name: 'Test' },
        request: { method: 'POST', path: '/api/test' },
        metrics: { duration: 234, memory: 1024 },
      })).not.toThrow();
    });

    it('should handle concurrent log calls', async () => {
      const promises = Array(10).fill(null).map((_, i) =>
        Promise.resolve(logger.info(`Message ${i}`))
      );

      await Promise.all(promises);
      expect(true).toBe(true); // If we got here, no errors
    });

    it('should handle mixed log levels concurrently', async () => {
      const promises = Array(20).fill(null).map((_, i) => {
        if (i % 3 === 0) return Promise.resolve(logger.info(`Info ${i}`));
        if (i % 3 === 1) return Promise.resolve(logger.warn(`Warn ${i}`));
        return Promise.resolve(logger.error(`Error ${i}`));
      });

      await Promise.all(promises);
      expect(true).toBe(true); // If we got here, no errors
    });
  });
});
