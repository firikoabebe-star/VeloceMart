import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../auth/email.service.js';
import { ContactMessageDto } from './dto/contact.dto.js';
import { contactEmailTemplate } from './templates/contact-email.template.js';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * True only when a delivery destination and a mail provider credential are
   * both configured. The controller uses this to expose an explicit
   * "unavailable" state instead of pretending a message was delivered.
   */
  isConfigured(): boolean {
    return (
      this.hasValue(this.config.get<string>('RESEND_API_KEY')) &&
      this.hasValue(this.config.get<string>('CONTACT_TO_EMAIL'))
    );
  }

  async submit(dto: ContactMessageDto): Promise<{ message: string }> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'The contact form is not available right now. Please try again later.',
      );
    }

    const to = this.config.get<string>('CONTACT_TO_EMAIL') as string;
    const html = contactEmailTemplate({
      ...dto,
      submittedAt: new Date(),
    });
    const subject = `[${dto.category}] ${dto.subject}`;

    try {
      await this.emailService.sendContactMessage({
        to,
        replyTo: dto.email,
        subject,
        html,
      });
    } catch (error) {
      // EmailService already sanitizes provider detail. Log only a bounded
      // category and never the visitor's address or message body.
      this.logger.error(
        `Contact message delivery failed (${this.safeErrorName(error)})`,
      );
      throw new ServiceUnavailableException(
        'We could not send your message right now. Please try again later.',
      );
    }

    return {
      message:
        'Thanks for reaching out. We have received your message and will reply to the email address you provided.',
    };
  }

  private hasValue(value: string | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

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
