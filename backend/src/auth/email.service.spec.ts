import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service.js';

const mockSend = jest.fn<Promise<unknown>, [Record<string, unknown>]>();

jest.mock('resend', () => ({
  Resend: jest.fn(() => ({ emails: { send: mockSend } })),
}));

describe('EmailService', () => {
  let service: EmailService;

  const config = {
    get: jest.fn((key: string) =>
      key === 'RESEND_FROM_EMAIL'
        ? 'VeloceMart <no-reply@example.com>'
        : 'test-api-key',
    ),
  } as unknown as ConfigService;

  beforeEach(() => {
    mockSend.mockReset();
    service = new EmailService(config);
  });

  it('sends the OTP email through Resend', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await service.sendOtpEmail('user@example.com', '123456');

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [payload] = mockSend.mock.calls[0];
    expect(payload.from).toBe('VeloceMart <no-reply@example.com>');
    expect(payload.to).toBe('user@example.com');
    expect(String(payload.html)).toContain('123456');
  });

  it('throws a generic error and logs without recipient PII on provider failure', async () => {
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'Invalid to field' },
    });

    await expect(
      service.sendOtpEmail('user@example.com', '123456'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    const logged = errorSpy.mock.calls
      .map((call: unknown[]) => call.join(' '))
      .join(' ');
    expect(logged).not.toContain('user@example.com');
    expect(logged).not.toContain('123456');
    expect(logged).not.toContain('Invalid to field');
    errorSpy.mockRestore();
  });

  it('wraps a thrown transport error and logs only a sanitized category', async () => {
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    mockSend.mockRejectedValueOnce(
      Object.assign(
        new Error('socket timeout while sending to user@example.com'),
        { name: 'ResendNetworkError' },
      ),
    );

    await expect(
      service.sendOtpEmail('user@example.com', '123456'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    const logged = errorSpy.mock.calls
      .map((call: unknown[]) => call.join(' '))
      .join(' ');
    expect(logged).not.toContain('user@example.com');
    expect(logged).not.toContain('123456');
    expect(logged).not.toContain('socket timeout');
    errorSpy.mockRestore();
  });
});
