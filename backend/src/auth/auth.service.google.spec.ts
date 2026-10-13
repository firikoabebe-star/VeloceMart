import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import type { Profile } from 'passport-google-oauth20';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { EmailService } from './email.service.js';
import { GOOGLE_OAUTH_PASSWORD_MARKER } from './google-oauth.constants.js';
import { GoogleOAuthError } from './google-oauth.error.js';

type UserRecord = {
  id: string;
  email: string;
  googleId: string | null;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  tokenVersion: number;
};

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: 'user-1',
    email: 'user@example.com',
    googleId: null,
    password: 'hashed:Password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER',
    emailVerified: true,
    tokenVersion: 0,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    provider: 'google',
    id: 'google-123',
    displayName: 'Google User',
    emails: [{ value: 'user@example.com', verified: true }],
    name: { givenName: 'Google', familyName: 'User' },
    _json: { email_verified: true },
    ...overrides,
  } as unknown as Profile;
}

function createPrismaMock(initialUsers: UserRecord[] = []) {
  const users = [...initialUsers];

  const user = {
    findUnique: jest.fn(
      (args: { where: { email?: string; id?: string; googleId?: string } }) =>
        Promise.resolve(
          users.find(
            (candidate) =>
              (args.where.email !== undefined &&
                candidate.email === args.where.email) ||
              (args.where.id !== undefined && candidate.id === args.where.id) ||
              (args.where.googleId !== undefined &&
                candidate.googleId === args.where.googleId),
          ) ?? null,
        ),
    ),
    create: jest.fn(
      (args: { data: Partial<UserRecord> & { email: string } }) => {
        const created: UserRecord = {
          id: `user-${users.length + 1}`,
          googleId: null,
          password: '',
          firstName: '',
          lastName: '',
          role: 'CUSTOMER',
          emailVerified: false,
          tokenVersion: 0,
          ...args.data,
        };
        users.push(created);
        return Promise.resolve(created);
      },
    ),
    update: jest.fn(
      (args: { where: { id: string }; data: Partial<UserRecord> }) => {
        const target = users.find(
          (candidate) => candidate.id === args.where.id,
        );
        if (!target) {
          throw new Error('User not found');
        }
        Object.assign(target, args.data);
        return Promise.resolve(target);
      },
    ),
  };

  return { prisma: { user } as unknown as PrismaService, users, user };
}

describe('AuthService Google Sign-In', () => {
  let service: AuthService;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let sign: jest.Mock<
    string,
    [Record<string, unknown>, Record<string, unknown>]
  >;
  let res: {
    cookie: jest.Mock<void, [string, string, Record<string, unknown>]>;
    clearCookie: jest.Mock<void, [string, Record<string, unknown>]>;
  };

  const build = async (users: UserRecord[] = []): Promise<void> => {
    prismaMock = createPrismaMock(users);
    sign = jest.fn(() => 'token');
    res = {
      cookie: jest.fn<void, [string, string, Record<string, unknown>]>(),
      clearCookie: jest.fn<void, [string, Record<string, unknown>]>(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock.prisma },
        { provide: JwtService, useValue: { sign } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => undefined) },
        },
        {
          provide: EmailService,
          useValue: {
            sendOtpEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  };

  describe('validateGoogleUser', () => {
    it('creates a verified CUSTOMER account linked to the Google id', async () => {
      await build();

      const result = await service.validateGoogleUser(makeProfile());

      expect(prismaMock.users).toHaveLength(1);
      const created = prismaMock.users[0];
      expect(created.email).toBe('user@example.com');
      expect(created.googleId).toBe('google-123');
      expect(created.password).toBe(GOOGLE_OAUTH_PASSWORD_MARKER);
      expect(created.emailVerified).toBe(true);
      expect(created.role).toBe('CUSTOMER');
      expect(created.firstName).toBe('Google');
      expect(created.lastName).toBe('User');
      expect(result).toEqual({
        id: created.id,
        email: 'user@example.com',
        role: 'CUSTOMER',
        tokenVersion: 0,
      });
    });

    it('accepts a Google email whose verified flag is only on the id_token claim', async () => {
      await build();

      const result = await service.validateGoogleUser(
        makeProfile({
          emails: [
            { value: 'user@example.com', verified: false },
          ] as Profile['emails'],
          _json: { email_verified: true } as Profile['_json'],
        }),
      );

      expect(result.email).toBe('user@example.com');
      expect(prismaMock.users[0].emailVerified).toBe(true);
    });

    it('normalizes the Google email before lookup and creation', async () => {
      await build();

      await service.validateGoogleUser(
        makeProfile({
          emails: [
            { value: '  MixedCase@Example.com  ', verified: true },
          ] as Profile['emails'],
        }),
      );

      expect(prismaMock.users[0].email).toBe('mixedcase@example.com');
    });

    it('signs in an existing account matched by googleId without relinking', async () => {
      await build([
        makeUser({
          googleId: 'google-123',
          password: GOOGLE_OAUTH_PASSWORD_MARKER,
          emailVerified: true,
          tokenVersion: 3,
        }),
      ]);

      const result = await service.validateGoogleUser(makeProfile());

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(result.id).toBe('user-1');
      expect(result.tokenVersion).toBe(3);
    });

    it('marks an existing unverified Google account verified', async () => {
      await build([
        makeUser({
          googleId: 'google-123',
          password: GOOGLE_OAUTH_PASSWORD_MARKER,
          emailVerified: false,
        }),
      ]);

      const result = await service.validateGoogleUser(makeProfile());

      expect(prismaMock.users[0].emailVerified).toBe(true);
      expect(result.id).toBe('user-1');
    });

    it('rejects a Google profile without a subject id', async () => {
      await build();

      await expect(
        service.validateGoogleUser(makeProfile({ id: '' })),
      ).rejects.toMatchObject({ code: 'google_id_missing' });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('rejects an unverified Google email', async () => {
      await build();

      await expect(
        service.validateGoogleUser(
          makeProfile({
            emails: [
              { value: 'user@example.com', verified: false },
            ] as Profile['emails'],
            _json: { email_verified: false } as Profile['_json'],
          }),
        ),
      ).rejects.toMatchObject({ code: 'google_unverified_email' });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('rejects a profile without an email', async () => {
      await build();

      await expect(
        service.validateGoogleUser(
          makeProfile({ emails: [] as Profile['emails'] }),
        ),
      ).rejects.toMatchObject({ code: 'email_missing' });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('links to an existing account when email matches', async () => {
      await build([
        makeUser({ googleId: null, password: 'hashed:Password123' }),
      ]);

      const result = await service.validateGoogleUser(makeProfile());

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalled();
      expect(prismaMock.users[0].googleId).toBe('google-123');
      expect(result.email).toBe('user@example.com');
    });

    it("refuses to overwrite another Google identity's account", async () => {
      await build([
        makeUser({
          googleId: 'google-other',
          password: GOOGLE_OAUTH_PASSWORD_MARKER,
        }),
      ]);

      await expect(
        service.validateGoogleUser(makeProfile()),
      ).rejects.toMatchObject({ code: 'email_mismatch' });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.users[0].googleId).toBe('google-other');
    });

    it('rejects a linked Google identity whose email no longer matches', async () => {
      await build([
        makeUser({
          googleId: 'google-123',
          email: 'old@example.com',
          password: GOOGLE_OAUTH_PASSWORD_MARKER,
        }),
      ]);

      await expect(
        service.validateGoogleUser(makeProfile()),
      ).rejects.toMatchObject({ code: 'email_mismatch' });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.users[0].email).toBe('old@example.com');
    });

    it('reuses the Google account created by a concurrent first login', async () => {
      await build();
      const raced = makeUser({
        googleId: 'google-123',
        password: GOOGLE_OAUTH_PASSWORD_MARKER,
        emailVerified: true,
      });
      prismaMock.user.create.mockRejectedValueOnce(
        Object.assign(new Error('unique'), { code: 'P2002' }),
      );
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(raced);

      const result = await service.validateGoogleUser(makeProfile());

      expect(result.id).toBe(raced.id);
    });

    it('links when concurrent creation finds existing email (raced case)', async () => {
      await build();
      prismaMock.user.create.mockRejectedValueOnce(
        Object.assign(new Error('unique'), { code: 'P2002' }),
      );
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          makeUser({ googleId: null, password: 'hashed:Password123' }),
        );

      const result = await service.validateGoogleUser(makeProfile());
      expect(result).toBeDefined();
    });

    it('reports a mismatch when a concurrent identity is inconsistent', async () => {
      await build();
      prismaMock.user.create.mockRejectedValueOnce(
        Object.assign(new Error('unique'), { code: 'P2002' }),
      );
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          makeUser({
            googleId: 'google-123',
            email: 'other@example.com',
            password: GOOGLE_OAUTH_PASSWORD_MARKER,
          }),
        );

      await expect(
        service.validateGoogleUser(makeProfile()),
      ).rejects.toMatchObject({ code: 'email_mismatch' });
    });

    it('rethrows a non-unique database error unchanged', async () => {
      await build();
      prismaMock.user.create.mockRejectedValueOnce(new Error('db down'));

      await expect(service.validateGoogleUser(makeProfile())).rejects.toThrow(
        'db down',
      );
    });

    it('links when email matches', async () => {
      await build([makeUser({ googleId: null })]);

      await service.validateGoogleUser(makeProfile());
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });

  describe('completeGoogleLogin', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'ADMIN',
      tokenVersion: 4,
    };

    it('issues the same httpOnly access/refresh cookies as a password login', async () => {
      await build();

      service.completeGoogleLogin(user, res as unknown as Response);

      const cookieMock = res.cookie;
      const names = cookieMock.mock.calls.map((call) => call[0]);
      expect(names).toEqual(['access_token', 'refresh_token']);
      for (const [, , options] of cookieMock.mock.calls) {
        expect(options).toMatchObject({ httpOnly: true, path: '/' });
      }
    });

    it('preserves the user role and tokenVersion in the issued tokens', async () => {
      await build();

      service.completeGoogleLogin(user, res as unknown as Response);

      const payloads = sign.mock.calls.map((call) => call[0]);
      expect(payloads).toHaveLength(2);
      for (const payload of payloads) {
        expect(payload).toMatchObject({
          sub: 'user-1',
          role: 'ADMIN',
          ver: 4,
        });
      }
    });
  });
});
