import { ConfigService } from '@nestjs/config';
import type { Profile } from 'passport-google-oauth20';
import type { AuthService } from '../auth.service.js';
import { GoogleOAuthError } from '../google-oauth.error.js';
import { GoogleStrategy } from './google.strategy.js';

const configWith = (values: Record<string, unknown>): ConfigService =>
  ({ get: jest.fn((key: string) => values[key]) }) as unknown as ConfigService;

const profile = (): Profile =>
  ({
    provider: 'google',
    id: 'google-123',
    emails: [{ value: 'user@example.com', verified: true }],
    _json: { email_verified: true },
  }) as unknown as Profile;

describe('GoogleStrategy', () => {
  it('uses the configured callback URL so the global "api" prefix is honoured', () => {
    const strategy = new GoogleStrategy(
      configWith({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: 'secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3001/api/auth/google/callback',
      }),
      { validateGoogleUser: jest.fn() } as unknown as AuthService,
    );

    const internal = strategy as unknown as { _callbackURL: string };
    expect(internal._callbackURL).toBe(
      'http://localhost:3001/api/auth/google/callback',
    );
  });

  it('falls back to the local prefixed callback when unset', () => {
    const strategy = new GoogleStrategy(
      configWith({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: 'secret',
      }),
      { validateGoogleUser: jest.fn() } as unknown as AuthService,
    );

    const internal = strategy as unknown as { _callbackURL: string };
    expect(internal._callbackURL).toBe(
      'http://localhost:3001/api/auth/google/callback',
    );
  });

  it('delegates profile resolution to the auth service', async () => {
    const resolved = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'CUSTOMER',
      tokenVersion: 0,
    };
    const validateGoogleUser = jest.fn().mockResolvedValue(resolved);
    const strategy = new GoogleStrategy(
      configWith({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: 'secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3001/api/auth/google/callback',
      }),
      { validateGoogleUser } as unknown as AuthService,
    );

    await expect(
      strategy.validate('access', 'refresh', profile()),
    ).resolves.toEqual(resolved);
    expect(validateGoogleUser).toHaveBeenCalledWith(expect.any(Object));
  });

  it('propagates the safe GoogleOAuthError code', async () => {
    const strategy = new GoogleStrategy(
      configWith({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: 'secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3001/api/auth/google/callback',
      }),
      {
        validateGoogleUser: jest
          .fn()
          .mockRejectedValue(new GoogleOAuthError('email_not_verified')),
      } as unknown as AuthService,
    );

    await expect(
      strategy.validate('access', 'refresh', profile()),
    ).rejects.toMatchObject({ code: 'email_not_verified' });
  });
});
