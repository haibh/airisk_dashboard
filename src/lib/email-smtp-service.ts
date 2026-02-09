import nodemailer from 'nodemailer';
import { logger } from './logger';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@airm-ip.com';

/**
 * Check if SMTP email is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
}

let transporter: nodemailer.Transporter | null = null;

/**
 * Get or create nodemailer transporter instance
 */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!isEmailConfigured()) {
      throw new Error('SMTP not configured - check SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

/**
 * Send email via SMTP
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}): Promise<void> {
  if (!isEmailConfigured()) {
    logger.warn('SMTP not configured, skipping email send');
    return;
  }

  try {
    const result = await getTransporter().sendMail({
      from: EMAIL_FROM,
      ...options,
    });

    logger.info(`Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`, {
      data: { messageId: result.messageId },
    });
  } catch (error) {
    logger.error('Failed to send email', error);
    throw error;
  }
}

/**
 * Send scheduled report email with attachment
 */
export async function sendReportEmail(params: {
  recipients: string[];
  reportType: string;
  buffer: Buffer;
  filename: string;
}): Promise<void> {
  const { recipients, reportType, buffer, filename } = params;

  if (recipients.length === 0) {
    logger.warn('No recipients for report email, skipping');
    return;
  }

  const subject = `AIRM-IP: ${reportType} Report Generated`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Report Generated</h2>
        <p>Your scheduled <strong>${reportType}</strong> report has been generated and is attached to this email.</p>
        <p><strong>Generated at:</strong> ${new Date().toISOString()}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 0.875rem; color: #6b7280;">
          <em>This is an automated message from AIRM-IP (AI Risk Management Intelligence Platform).</em>
        </p>
      </body>
    </html>
  `;

  await sendEmail({
    to: recipients,
    subject,
    html,
    attachments: [
      {
        filename,
        content: buffer,
      },
    ],
  });
}
