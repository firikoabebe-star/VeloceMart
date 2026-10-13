import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactService } from './contact.service.js';
import { EmailService } from '../auth/email.service.js';
import { ContactCategory } from './dto/contact.dto.js';

interface ContactPayload {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}

function makeConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

const baseDto = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  category: ContactCategory.GENERAL,
  subject: 'Hello there',
  message: 'I have a question about my recent order.',
};

describe('ContactService', () => {
  const sendContactMessage = jest.fn<Promise<void>, [ContactPayload]>();
  const email = { sendContactMessage } as unknown as EmailService;

  beforeEach(() => {
    sendContactMessage.mockReset();
  });

  it('reports unavailable when the destination is missing', () => {
    const service = new ContactService(
      makeConfig({ RESEND_API_KEY: 'key' }),
      email,
    );
    expect(service.isConfigured()).toBe(false);
  });

  it('reports unavailable when the mail credential is missing', () => {
    const service = new ContactService(
      makeConfig({ CONTACT_TO_EMAIL: 'support@example.com' }),
      email,
    );
    expect(service.isConfigured()).toBe(false);
  });

  it('rejects a submission with 503 when not configured', async () => {
    const service = new ContactService(makeConfig({}), email);

    await expect(service.submit(baseDto)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(sendContactMessage).not.toHaveBeenCalled();
  });

  it('forwards the message to the configured inbox with reply-to', async () => {
    sendContactMessage.mockResolvedValue(undefined);
    const service = new ContactService(
      makeConfig({
        RESEND_API_KEY: 'key',
        CONTACT_TO_EMAIL: 'support@example.com',
      }),
      email,
    );

    const result = await service.submit(baseDto);

    expect(sendContactMessage).toHaveBeenCalledTimes(1);
    const payload = sendContactMessage.mock.calls[0][0];
    expect(payload.to).toBe('support@example.com');
    expect(payload.replyTo).toBe('ada@example.com');
    expect(payload.subject).toContain('Hello there');
    expect(result.message).toContain('Thanks');
  });

  it('escapes HTML in the visitor message', async () => {
    sendContactMessage.mockResolvedValue(undefined);
    const service = new ContactService(
      makeConfig({
        RESEND_API_KEY: 'key',
        CONTACT_TO_EMAIL: 'support@example.com',
      }),
      email,
    );

    await service.submit({
      ...baseDto,
      message: '<script>alert(1)</script> please help',
    });

    const payload = sendContactMessage.mock.calls[0][0];
    expect(payload.html).not.toContain('<script>');
    expect(payload.html).toContain('&lt;script&gt;');
  });

  it('surfaces delivery failures as 503 and does not log PII', async () => {
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    sendContactMessage.mockRejectedValue(
      Object.assign(new Error('failed for ada@example.com'), {
        name: 'InternalServerErrorException',
      }),
    );
    const service = new ContactService(
      makeConfig({
        RESEND_API_KEY: 'key',
        CONTACT_TO_EMAIL: 'support@example.com',
      }),
      email,
    );

    await expect(service.submit(baseDto)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    const logged = errorSpy.mock.calls
      .map((call: unknown[]) => call.join(' '))
      .join(' ');
    expect(logged).not.toContain('ada@example.com');
    expect(logged).not.toContain('failed for');
    errorSpy.mockRestore();
  });
});
