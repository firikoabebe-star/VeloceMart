import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  otpEmailTemplate,
  passwordResetEmailTemplate,
} from './templates/otp-email.template.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.fromEmail =
      this.config.get<string>('RESEND_FROM_EMAIL') ??
      'VeloceMart <noreply@base.et>';
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    await this.deliver(
      to,
      'Your VeloceMart verification code',
      otpEmailTemplate(code),
      'OTP',
    );
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    await this.deliver(
      to,
      'Reset your VeloceMart password',
      passwordResetEmailTemplate(code),
      'password reset',
    );
  }

  // Forwards a visitor's support message to the configured inbox. The reply-to
  // is the visitor's address so an operator can answer directly, while the
  // authenticated `from` stays on the verified sending domain. `replyTo` is
  // validated by the provider and never used as the envelope sender.
  async sendContactMessage(params: {
    to: string;
    replyTo: string;
    subject: string;
    html: string;
  }): Promise<void> {
    await this.deliver(params.to, params.subject, params.html, 'contact', {
      replyTo: params.replyTo,
    });
  }

  private async deliver(
    to: string,
    subject: string,
    html: string,
    label: string,
    options: { replyTo?: string } = {},
  ): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      });

      if (error) {
        this.logger.error(
          `Failed to send ${label} email (provider error: ${this.safeErrorName(error)})`,
        );
        throw new InternalServerErrorException('Failed to send email');
      }
    } catch (error) {
      // Already sanitized above: rethrow without logging the raw payload again.
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      // Wrap transport/network failures so provider details never reach the
      // caller and only a bounded error category is logged.
      this.logger.error(
        `Failed to send ${label} email (transport error: ${this.safeErrorName(error)})`,
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  // Returns a bounded, PII-free error category for operational logs. Provider
  // messages, recipient addresses and OTP values are intentionally excluded.
  private safeErrorName(error: unknown): string {
    if (error && typeof error === 'object' && 'name' in error) {
      const name = (error as { name?: unknown }).name;
      if (typeof name === 'string' && name.length > 0) {
        return name.slice(0, 64);
      }
    }
    return 'UnknownError';
  }
}
