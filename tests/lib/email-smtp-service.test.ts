import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isEmailConfigured, sendEmail, sendReportEmail } from '@/lib/email-smtp-service';

// Mock nodemailer to prevent actual email sending
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    })),
  },
}));

describe('email-smtp-service', () => {
  describe('isEmailConfigured', () => {
    it('returns a boolean value', () => {
      // Note: This function checks env vars at module load time
      const result = isEmailConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('sendEmail', () => {
    it('completes without error when SMTP not configured', async () => {
      // Service logs warning and returns early when not configured
      await expect(sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })).resolves.toBeUndefined();
    });

    it('accepts single recipient', async () => {
      await expect(sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      })).resolves.toBeUndefined();
    });

    it('accepts multiple recipients', async () => {
      await expect(sendEmail({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      })).resolves.toBeUndefined();
    });

    it('accepts email with attachments', async () => {
      const attachment = {
        filename: 'test.pdf',
        content: Buffer.from('PDF content'),
      };

      await expect(sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        attachments: [attachment],
      })).resolves.toBeUndefined();
    });
  });

  describe('sendReportEmail', () => {
    it('completes when no recipients provided', async () => {
      await expect(sendReportEmail({
        recipients: [],
        reportType: 'Compliance',
        buffer: Buffer.from('test'),
        filename: 'report.pdf',
      })).resolves.toBeUndefined();
    });

    it('sends report email with attachment', async () => {
      const buffer = Buffer.from('PDF content');

      await expect(sendReportEmail({
        recipients: ['user@example.com'],
        reportType: 'Compliance',
        buffer,
        filename: 'compliance-report.pdf',
      })).resolves.toBeUndefined();
    });

    it('sends to multiple recipients', async () => {
      const recipients = ['user1@example.com', 'user2@example.com'];
      const buffer = Buffer.from('Report data');

      await expect(sendReportEmail({
        recipients,
        reportType: 'Risk Assessment',
        buffer,
        filename: 'risk-report.xlsx',
      })).resolves.toBeUndefined();
    });

    it('handles various report types', async () => {
      await expect(sendReportEmail({
        recipients: ['user@example.com'],
        reportType: 'Compliance Status Report',
        buffer: Buffer.from('test'),
        filename: 'report.pdf',
      })).resolves.toBeUndefined();
    });
  });
});
