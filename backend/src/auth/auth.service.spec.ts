import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { EmailService } from './email.service.js';

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn((password: string) => Promise.resolve(`hashed:${password}`)),
    compare: jest.fn((password: string, hash: string) =>
      Promise.resolve(hash === `hashed:${password}`),
    ),
  },
}));

type OtpPurposeValue = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

type OtpRecord = {
  id: string;
  userId: string;
  code: string;
  purpose: OtpPurposeValue;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
};

type UserRecord = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: 'user-1',
    email: 'user@example.com',
    password: 'hashed:Password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER',
    emailVerified: false,
    tokenVersion: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function makeOtp(overrides: Partial<OtpRecord> = {}): OtpRecord {
  return {
    id: 'otp-1',
    userId: 'user-1',
    code: '123456',
    purpose: 'EMAIL_VERIFICATION',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    used: false,
    createdAt: new Date(),
    ...overrides,
  };
}

function createPrismaMock(
  initialUsers: UserRecord[] = [],
  initialOtps: OtpRecord[] = [],
) {
  const users = [...initialUsers];
  const otps = [...initialOtps];
  let otpSeq = initialOtps.length;

  const matches = (otp: OtpRecord, where: Partial<OtpRecord>): boolean =>
    (where.id === undefined || otp.id === where.id) &&
    (where.userId === undefined || otp.userId === where.userId) &&
    (where.used === undefined || otp.used === where.used) &&
    (where.purpose === undefined || otp.purpose === where.purpose);

  const emailOtp = {
    findFirst: jest.fn(
      (args: {
        where: { userId: string; used?: boolean; purpose?: OtpPurposeValue };
        orderBy?: unknown;
      }): Promise<OtpRecord | null> => {
        const found = otps
          .filter((otp) => matches(otp, args.where))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return Promise.resolve(found[0] ?? null);
      },
    ),
    updateMany: jest.fn(
      (args: {
        where: {
          id?: string;
          userId?: string;
          used?: boolean;
          purpose?: OtpPurposeValue;
        };
        data: { used: boolean };
      }): Promise<{ count: number }> => {
        let count = 0;
        for (const otp of otps) {
          if (matches(otp, args.where)) {
            otp.used = args.data.used;
            count += 1;
          }
        }
        return Promise.resolve({ count });
      },
    ),
    create: jest.fn(
      (args: {
        data: {
          userId: string;
          code: string;
          expiresAt: Date;
          purpose: OtpPurposeValue;
        };
      }): Promise<OtpRecord> => {
        otpSeq += 1;
        const otp: OtpRecord = {
          id: `otp-${otpSeq}`,
          used: false,
          createdAt: new Date(),
          ...args.data,
        };
        otps.push(otp);
        return Promise.resolve(otp);
      },
    ),
  };

  const user = {
    findUnique: jest.fn(
      (args: {
        where: { email?: string; id?: string };
      }): Promise<UserRecord | null> =>
        Promise.resolve(
          users.find(
            (candidate) =>
              candidate.email === args.where.email ||
              candidate.id === args.where.id,
          ) ?? null,
        ),
    ),
    create: jest.fn(
      (args: {
        data: Partial<UserRecord> & { email: string };
      }): Promise<UserRecord> => {
        const created: UserRecord = {
          id: `user-${users.length + 1}`,
          password: '',
          firstName: '',
          lastName: '',
          role: 'CUSTOMER',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.data,
        };
        users.push(created);
        return Promise.resolve(created);
      },
    ),
    update: jest.fn(
      (args: {
        where: { id: string };
        data: Partial<UserRecord> & {
          tokenVersion?: number | { increment: number };
        };
      }): Promise<UserRecord> => {
        const target = users.find(
          (candidate) => candidate.id === args.where.id,
        );
        if (!target) {
          throw new Error('User not found');
        }
        const { tokenVersion, ...rest } = args.data;
        Object.assign(target, rest);
        if (typeof tokenVersion === 'number') {
          target.tokenVersion = tokenVersion;
        } else if (tokenVersion && 'increment' in tokenVersion) {
          target.tokenVersion += tokenVersion.increment;
        }
        return Promise.resolve(target);
      },
    ),
  };

  let lock: Promise<void> = Promise.resolve();
  const withLock = async <T>(fn: () => Promise<T>): Promise<T> => {
    const previous = lock;
    let release: () => void = () => undefined;
    lock = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  };

  const tx = {
    $queryRaw: jest.fn(() => Promise.resolve([{ id: 'locked' }])),
    emailOtp,
    user,
  };

  const prisma = {
    user,
    emailOtp,
    // Emulates the Postgres row lock taken by `SELECT ... FOR UPDATE`:
    // concurrent transactions for the same user are serialized. A failing
    // transaction rolls back its writes, like a real interactive transaction.
    $transaction: jest.fn((cb: (client: typeof tx) => Promise<unknown>) =>
      withLock(async () => {
        const usersSnapshot = users.map((candidate) => ({ ...candidate }));
        const otpsSnapshot = otps.map((otp) => ({ ...otp }));
        try {
          return await cb(tx);
        } catch (error) {
          users.length = 0;
          users.push(...usersSnapshot);
          otps.length = 0;
          otps.push(...otpsSnapshot);
          throw error;
        }
      }),
    ),
  };

  return { prisma, users, otps, tx };
}

describe('AuthService', () => {
  let service: AuthService;
  let email: { sendOtpEmail: jest.Mock; sendPasswordResetEmail: jest.Mock };
  let res: { cookie: jest.Mock; clearCookie: jest.Mock };
  let prismaMock: ReturnType<typeof createPrismaMock>;

  const build = async (
    users: UserRecord[] = [],
    otps: OtpRecord[] = [],
  ): Promise<void> => {
    prismaMock = createPrismaMock(users, otps);
    email = {
      sendOtpEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    res = { cookie: jest.fn(), clearCookie: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock.prisma },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token') } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => undefined) },
        },
        { provide: EmailService, useValue: email },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    const registration = {
      email: 'new@example.com',
      password: 'Password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('creates an unverified user, stores an OTP and emails it', async () => {
      await build();

      const result = await service.register(registration);

      expect(result.email).toBe('new@example.com');
      expect(result.emailVerified).toBe(false);
      expect(prismaMock.otps).toHaveLength(1);
      expect(prismaMock.otps[0].used).toBe(false);
      expect(email.sendOtpEmail).toHaveBeenCalledWith(
        'new@example.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('does not issue authentication cookies', async () => {
      await build();

      await service.register(registration);

      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('rejects a duplicate email that is already verified', async () => {
      await build([makeUser({ emailVerified: true })]);

      await expect(
        service.register({ ...registration, email: 'user@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(email.sendOtpEmail).not.toHaveBeenCalled();
      expect(prismaMock.users).toHaveLength(1);
    });

    it('recovers an existing unverified account without duplicating it', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);

      const result = await service.register({
        ...registration,
        email: 'user@example.com',
      });

      expect(result.email).toBe('user@example.com');
      expect(result.emailVerified).toBe(false);
      expect(prismaMock.users).toHaveLength(1);
      expect(email.sendOtpEmail).toHaveBeenCalledTimes(1);
      const unused = prismaMock.otps.filter((otp) => !otp.used);
      expect(unused).toHaveLength(1);
      expect(unused[0].code).not.toBe('111111');
    });

    it('does not overwrite the password of an existing unverified account', async () => {
      await build([makeUser({ password: 'hashed:OriginalPass1' })]);

      await service.register({
        ...registration,
        email: 'user@example.com',
        password: 'AttackerPass1',
      });

      expect(prismaMock.users[0].password).toBe('hashed:OriginalPass1');
    });

    it('returns a safe error when the OTP email fails after persistence', async () => {
      await build();
      email.sendOtpEmail.mockRejectedValueOnce(
        new InternalServerErrorException('Failed to send verification email'),
      );

      await expect(service.register(registration)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );

      expect(prismaMock.users).toHaveLength(1);
      expect(prismaMock.users[0].emailVerified).toBe(false);
      expect(prismaMock.otps.filter((otp) => !otp.used)).toHaveLength(1);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('lets the user retry registration after a delivery failure', async () => {
      await build();
      email.sendOtpEmail.mockRejectedValueOnce(
        new InternalServerErrorException('Failed to send verification email'),
      );

      await expect(service.register(registration)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      const firstCode = prismaMock.otps[0].code;

      email.sendOtpEmail.mockResolvedValueOnce(undefined);
      const result = await service.register(registration);

      expect(result.emailVerified).toBe(false);
      expect(prismaMock.users).toHaveLength(1);
      expect(email.sendOtpEmail).toHaveBeenCalledTimes(2);
      const unused = prismaMock.otps.filter((otp) => !otp.used);
      expect(unused).toHaveLength(1);
      expect(unused[0].code).not.toBe(firstCode);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('does not report success when the OTP cannot be persisted', async () => {
      await build();
      prismaMock.prisma.emailOtp.create.mockRejectedValueOnce(
        new Error('database unavailable'),
      );

      await expect(service.register(registration)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      expect(email.sendOtpEmail).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('does not leak the OTP, recipient or provider details in logs or response', async () => {
      await build();
      const providerError = Object.assign(
        new Error(
          'Resend rejected new@example.com with key secret-key-123: Invalid to field',
        ),
        { name: 'validation_error' },
      );
      email.sendOtpEmail.mockRejectedValueOnce(providerError);

      const error = await service
        .register(registration)
        .then(() => null)
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ServiceUnavailableException);
      const responseBody = JSON.stringify(
        (error as ServiceUnavailableException).getResponse(),
      );
      const logged = (Logger.prototype.error as jest.Mock).mock.calls
        .map((call: unknown[]) => call.join(' '))
        .join(' ');
      const code = prismaMock.otps[0].code;

      for (const secret of [
        'new@example.com',
        code,
        'secret-key-123',
        'Invalid to field',
      ]) {
        expect(responseBody).not.toContain(secret);
        expect(logged).not.toContain(secret);
      }
    });
  });

  describe('verifyEmail', () => {
    it('marks the user verified, consumes the OTP and sets cookies', async () => {
      await build([makeUser()], [makeOtp({ code: '654321' })]);

      const result = await service.verifyEmail(
        { email: 'user@example.com', code: '654321' },
        res as unknown as Response,
      );

      expect(result.emailVerified).toBe(true);
      expect(prismaMock.otps[0].used).toBe(true);
      expect(prismaMock.users[0].emailVerified).toBe(true);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'token',
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'token',
        expect.any(Object),
      );
    });

    it('rejects an unknown account without leaking existence', async () => {
      await build();

      await expect(
        service.verifyEmail(
          { email: 'ghost@example.com', code: '123456' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('rejects an already verified account', async () => {
      await build([makeUser({ emailVerified: true })], [makeOtp()]);

      await expect(
        service.verifyEmail(
          { email: 'user@example.com', code: '123456' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a wrong code', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);

      await expect(
        service.verifyEmail(
          { email: 'user@example.com', code: '222222' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.otps[0].used).toBe(false);
    });

    it('does not accept a password-reset code for email verification', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '654321', purpose: 'PASSWORD_RESET' })],
      );

      await expect(
        service.verifyEmail(
          { email: 'user@example.com', code: '654321' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.otps[0].used).toBe(false);
      expect(prismaMock.users[0].emailVerified).toBe(false);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('sets httpOnly cookies with a root refresh path so refresh honours the "api" prefix', async () => {
      await build([makeUser()], [makeOtp({ code: '654321' })]);

      await service.verifyEmail(
        { email: 'user@example.com', code: '654321' },
        res as unknown as Response,
      );

      const cookieMock = res.cookie as jest.Mock<
        unknown,
        [string, string, Record<string, unknown>]
      >;
      const cookieCalls: Array<[string, string, Record<string, unknown>]> = [];
      for (const name of ['access_token', 'refresh_token'] as const) {
        const found = cookieMock.mock.calls.find((call) => call[0] === name);
        expect(found).toBeDefined();
        if (found) {
          cookieCalls.push(found);
        }
      }

      expect(cookieCalls).toHaveLength(2);
      for (const [, , options] of cookieCalls) {
        expect(options.path).toBe('/');
        expect(options.httpOnly).toBe(true);
      }
    });

    it('rejects an expired code', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '123456', expiresAt: new Date(Date.now() - 1000) })],
      );

      await expect(
        service.verifyEmail(
          { email: 'user@example.com', code: '123456' },
          res as unknown as Response,
        ),
      ).rejects.toThrow('expired');
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('rejects an already-used code', async () => {
      await build([makeUser()], [makeOtp({ used: true })]);

      await expect(
        service.verifyEmail(
          { email: 'user@example.com', code: '123456' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the code was consumed concurrently', async () => {
      await build([makeUser()], [makeOtp({ code: '123456' })]);
      prismaMock.prisma.emailOtp.updateMany.mockResolvedValueOnce({
        count: 0,
      });

      await expect(
        service.verifyEmail(
          { email: 'user@example.com', code: '123456' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.users[0].emailVerified).toBe(false);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('allows only one of two concurrent verifications to succeed', async () => {
      await build([makeUser()], [makeOtp({ code: '123456' })]);

      const results = await Promise.allSettled([
        service.verifyEmail(
          { email: 'user@example.com', code: '123456' },
          res as unknown as Response,
        ),
        service.verifyEmail(
          { email: 'user@example.com', code: '123456' },
          res as unknown as Response,
        ),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
    });
  });

  describe('resendOtp', () => {
    const genericMessage = (result: { message: string }) =>
      expect(result.message).toContain('If an account');

    it('returns the same generic message for unknown accounts', async () => {
      await build();

      const result = await service.resendOtp({ email: 'ghost@example.com' });

      genericMessage(result);
      expect(email.sendOtpEmail).not.toHaveBeenCalled();
      expect(prismaMock.otps).toHaveLength(0);
    });

    it('returns the same generic message for verified accounts', async () => {
      await build([makeUser({ emailVerified: true })]);

      const result = await service.resendOtp({ email: 'user@example.com' });

      genericMessage(result);
      expect(email.sendOtpEmail).not.toHaveBeenCalled();
      expect(prismaMock.otps).toHaveLength(0);
    });

    it('invalidates the previous code and sends a new one for eligible accounts', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);

      const result = await service.resendOtp({ email: 'user@example.com' });

      genericMessage(result);
      expect(email.sendOtpEmail).toHaveBeenCalledTimes(1);
      expect(prismaMock.otps).toHaveLength(2);
      const unused = prismaMock.otps.filter((otp) => !otp.used);
      expect(unused).toHaveLength(1);
      expect(unused[0].code).not.toBe('111111');
    });

    it('stays generic and logs safely when email delivery fails', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);
      email.sendOtpEmail.mockRejectedValueOnce(
        Object.assign(
          new Error('Resend rejected user@example.com: Invalid to field'),
          { name: 'validation_error' },
        ),
      );

      const result = await service.resendOtp({ email: 'user@example.com' });

      genericMessage(result);
      const logged = (Logger.prototype.error as jest.Mock).mock.calls
        .map((call: unknown[]) => call.join(' '))
        .join(' ');
      expect(logged).not.toContain('user@example.com');
      expect(logged).not.toContain('Invalid to field');
    });

    it('stays generic and logs safely when a new OTP cannot be persisted', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);
      prismaMock.prisma.emailOtp.create.mockRejectedValueOnce(
        new Error('database unavailable'),
      );

      const result = await service.resendOtp({ email: 'user@example.com' });

      genericMessage(result);
      expect(email.sendOtpEmail).not.toHaveBeenCalled();
      const logged = (Logger.prototype.error as jest.Mock).mock.calls
        .map((call: unknown[]) => call.join(' '))
        .join(' ');
      expect(logged).toContain('Resend OTP persistence failed');
      expect(logged).not.toContain('user@example.com');
    });

    it('keeps the previous code valid when persistence fails (rollback)', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);
      prismaMock.prisma.emailOtp.create.mockRejectedValueOnce(
        new Error('database unavailable'),
      );

      await service.resendOtp({ email: 'user@example.com' });

      const unused = prismaMock.otps.filter((otp) => !otp.used);
      expect(unused).toHaveLength(1);
      expect(unused[0].code).toBe('111111');
    });

    it('leaves exactly one unused code for two concurrent resends', async () => {
      await build([makeUser()], [makeOtp({ code: '111111' })]);

      await Promise.all([
        service.resendOtp({ email: 'user@example.com' }),
        service.resendOtp({ email: 'user@example.com' }),
      ]);

      const unused = prismaMock.otps.filter((otp) => !otp.used);
      expect(unused).toHaveLength(1);
      expect(email.sendOtpEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('forgotPassword', () => {
    it('returns a generic message for unknown accounts without sending email', async () => {
      await build();

      const result = await service.forgotPassword({
        email: 'ghost@example.com',
      });

      expect(result.message).toContain('If an account');
      expect(email.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(prismaMock.otps).toHaveLength(0);
    });

    it('issues a PASSWORD_RESET code and emails it for known accounts', async () => {
      await build([makeUser()]);

      const result = await service.forgotPassword({
        email: 'user@example.com',
      });

      expect(result.message).toContain('If an account');
      expect(prismaMock.otps).toHaveLength(1);
      expect(prismaMock.otps[0].purpose).toBe('PASSWORD_RESET');
      expect(email.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('does not invalidate a pending email-verification code', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '111111', purpose: 'EMAIL_VERIFICATION' })],
      );

      await service.forgotPassword({ email: 'user@example.com' });

      const emailOtp = prismaMock.otps.find(
        (otp) => otp.purpose === 'EMAIL_VERIFICATION',
      );
      expect(emailOtp?.used).toBe(false);
      expect(
        prismaMock.otps.filter((otp) => otp.purpose === 'PASSWORD_RESET'),
      ).toHaveLength(1);
    });

    it('invalidates the previous reset code when a new one is requested', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '111111', purpose: 'PASSWORD_RESET' })],
      );

      await service.forgotPassword({ email: 'user@example.com' });

      const reset = prismaMock.otps.filter(
        (otp) => otp.purpose === 'PASSWORD_RESET',
      );
      expect(reset).toHaveLength(2);
      expect(reset.find((otp) => otp.used)?.code).toBe('111111');
      const active = reset.find((otp) => !otp.used);
      expect(active?.code).not.toBe('111111');
    });

    it('stays generic and logs safely when reset email delivery fails', async () => {
      await build([makeUser()]);
      email.sendPasswordResetEmail.mockRejectedValueOnce(
        Object.assign(
          new Error('Resend rejected user@example.com: Invalid to field'),
          { name: 'validation_error' },
        ),
      );

      const result = await service.forgotPassword({
        email: 'user@example.com',
      });

      expect(result.message).toContain('If an account');
      const logged = (Logger.prototype.error as jest.Mock).mock.calls
        .map((call: unknown[]) => call.join(' '))
        .join(' ');
      expect(logged).not.toContain('user@example.com');
      expect(logged).not.toContain('Invalid to field');
    });
  });

  describe('resetPassword', () => {
    const reset = {
      email: 'user@example.com',
      code: '222222',
      newPassword: 'NewPassword1',
    };

    it('resets the password, consumes the code, bumps tokenVersion and clears cookies', async () => {
      await build(
        [makeUser({ tokenVersion: 2 })],
        [makeOtp({ code: '222222', purpose: 'PASSWORD_RESET' })],
      );

      const result = await service.resetPassword(
        reset,
        res as unknown as Response,
      );

      expect(result.message).toContain('Password reset successful');
      expect(prismaMock.users[0].password).toBe('hashed:NewPassword1');
      expect(prismaMock.users[0].tokenVersion).toBe(3);
      expect(prismaMock.otps[0].used).toBe(true);
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.any(Object),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(Object),
      );
    });

    it('rejects unknown accounts with a generic invalid-code error', async () => {
      await build();

      await expect(
        service.resetPassword(reset, res as unknown as Response),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(res.clearCookie).not.toHaveBeenCalled();
    });

    it('rejects a wrong code', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '222222', purpose: 'PASSWORD_RESET' })],
      );

      await expect(
        service.resetPassword(
          { ...reset, code: '333333' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.otps[0].used).toBe(false);
      expect(prismaMock.users[0].tokenVersion).toBe(0);
    });

    it('rejects an already-used code with a clear message', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '222222', purpose: 'PASSWORD_RESET', used: true })],
      );

      await expect(
        service.resetPassword(reset, res as unknown as Response),
      ).rejects.toThrow('already been used');
      expect(res.clearCookie).not.toHaveBeenCalled();
    });

    it('rejects an expired code with a clear message', async () => {
      await build(
        [makeUser()],
        [
          makeOtp({
            code: '222222',
            purpose: 'PASSWORD_RESET',
            expiresAt: new Date(Date.now() - 1000),
          }),
        ],
      );

      await expect(
        service.resetPassword(reset, res as unknown as Response),
      ).rejects.toThrow('expired');
    });

    it('does not accept an email-verification code', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '222222', purpose: 'EMAIL_VERIFICATION' })],
      );

      await expect(
        service.resetPassword(reset, res as unknown as Response),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('lets only one of two concurrent resets succeed', async () => {
      await build(
        [makeUser()],
        [makeOtp({ code: '222222', purpose: 'PASSWORD_RESET' })],
      );

      const results = await Promise.allSettled([
        service.resetPassword(reset, res as unknown as Response),
        service.resetPassword(reset, res as unknown as Response),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
      expect(prismaMock.users[0].tokenVersion).toBe(1);
    });
  });

  describe('login', () => {
    it('rejects unverified users after valid credentials', async () => {
      await build([makeUser({ emailVerified: false })]);

      await expect(
        service.login(
          { email: 'user@example.com', password: 'Password123' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('rejects unknown credentials with a generic error', async () => {
      await build([makeUser({ emailVerified: true })]);

      await expect(
        service.login(
          { email: 'user@example.com', password: 'WrongPassword' },
          res as unknown as Response,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues cookies for verified users', async () => {
      await build([makeUser({ emailVerified: true })]);

      const result = await service.login(
        { email: 'user@example.com', password: 'Password123' },
        res as unknown as Response,
      );

      expect(result.email).toBe('user@example.com');
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'token',
        expect.any(Object),
      );
    });
  });
});
