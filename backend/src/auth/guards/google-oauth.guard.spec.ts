import type { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';
import {
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
} from '../google-oauth.constants.js';
import { GoogleOAuthError } from '../google-oauth.error.js';
import { GoogleAuthGuard } from './google-auth.guard.js';
import { GoogleCallbackGuard } from './google-callback.guard.js';

const configWith = (values: Record<string, unknown>): ConfigService =>
  ({ get: jest.fn((key: string) => values[key]) }) as unknown as ConfigService;

const configuredConfig = () =>
  configWith({
    FRONTEND_URL: 'https://front.example',
    GOOGLE_CLIENT_ID: 'id',
    GOOGLE_CLIENT_SECRET: 'secret',
    GOOGLE_CALLBACK_URL: 'https://backend.example/api/auth/google/callback',
  });

const contextFor = (
  req: Record<string, unknown>,
  res: Record<string, unknown>,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  }) as unknown as ExecutionContext;

const makeResponse = (): {
  cookie: jest.Mock<void, [string, string, Record<string, unknown>]>;
  clearCookie: jest.Mock<void, [string, Record<string, unknown>]>;
  redirect: jest.Mock<void, [string]>;
  headersSent: boolean;
} => ({
  cookie: jest.fn<void, [string, string, Record<string, unknown>]>(),
  clearCookie: jest.fn<void, [string, Record<string, unknown>]>(),
  redirect: jest.fn<void, [string]>(),
  headersSent: false,
});

describe('GoogleAuthGuard', () => {
  it('sets a state and redirect cookie and forwards the state to Google', () => {
    const guard = new GoogleAuthGuard(configuredConfig());
    const req = { headers: { origin: 'https://front.example' } };
    const res = makeResponse();

    const options = guard.getAuthenticateOptions(
      contextFor(req, res),
    ) as Record<string, unknown>;

    expect(options.scope).toEqual(['email', 'profile']);
    expect(typeof options.state).toBe('string');
    expect((options.state as string).length).toBeGreaterThan(20);

    const names = res.cookie.mock.calls.map((call) => call[0]);
    expect(names).toEqual(
      expect.arrayContaining([OAUTH_STATE_COOKIE, OAUTH_REDIRECT_COOKIE]),
    );
    for (const [, , cookieOptions] of res.cookie.mock.calls) {
      expect(cookieOptions).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  });

  it('redirects to the frontend with a safe reason when not configured', async () => {
    const guard = new GoogleAuthGuard(configWith({}));
    const req = { headers: { origin: 'https://front.example' } };
    const res = makeResponse();

    const result = await guard.canActivate(contextFor(req, res));

    expect(result).toBe(true);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    const location = res.redirect.mock.calls[0][0];
    expect(location).toContain('error=not_configured');
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

describe('GoogleCallbackGuard', () => {
  it('redirects with state_mismatch and clears the transient cookies', async () => {
    const guard = new GoogleCallbackGuard(configuredConfig());
    const req = {
      headers: {},
      cookies: {
        [OAUTH_STATE_COOKIE]: 'nonce',
        [OAUTH_REDIRECT_COOKIE]: 'https://front.example',
      },
      query: { state: 'tampered' },
    };
    const res = makeResponse();

    const result = await guard.canActivate(contextFor(req, res));

    expect(result).toBe(true);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect.mock.calls[0][0]).toContain('error=state_mismatch');
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('maps an account-linking conflict to a safe reason', () => {
    const guard = new GoogleCallbackGuard(configuredConfig());
    const req = { frontendRedirect: 'https://front.example' };
    const res = makeResponse();

    const user = guard.handleRequest(
      new GoogleOAuthError('account_conflict'),
      null,
      undefined,
      contextFor(req, res),
    );

    expect(user).toBeNull();
    const location = res.redirect.mock.calls[0][0];
    expect(location).toContain('error=account_conflict');
  });

  it('maps an unverified email to a safe reason', () => {
    const guard = new GoogleCallbackGuard(configuredConfig());
    const req = { frontendRedirect: 'https://front.example' };
    const res = makeResponse();

    guard.handleRequest(
      new GoogleOAuthError('email_not_verified'),
      null,
      undefined,
      contextFor(req, res),
    );

    expect(res.redirect.mock.calls[0][0]).toContain(
      'error=email_not_verified',
    );
  });

  it('maps an unexpected OAuth failure to oauth_failed', () => {
    const guard = new GoogleCallbackGuard(configuredConfig());
    const req = { frontendRedirect: 'https://front.example' };
    const res = makeResponse();

    guard.handleRequest(
      new Error('boom'),
      null,
      undefined,
      contextFor(req, res),
    );

    expect(res.redirect.mock.calls[0][0]).toContain('error=oauth_failed');
  });

  it('maps a missing user with an access_denied info to access_denied', () => {
    const guard = new GoogleCallbackGuard(configuredConfig());
    const req = { frontendRedirect: 'https://front.example' };
    const res = makeResponse();

    guard.handleRequest(
      null,
      null,
      { message: 'access_denied' },
      contextFor(req, res),
    );

    expect(res.redirect.mock.calls[0][0]).toContain('error=access_denied');
  });

  it('passes a resolved user through without redirecting', () => {
    const guard = new GoogleCallbackGuard(configuredConfig());
    const req = { frontendRedirect: 'https://front.example' };
    const res = makeResponse();
    const user = {
      id: 'user-1',
      email: 'u@example.com',
      role: 'CUSTOMER',
      tokenVersion: 0,
    };

    const result = guard.handleRequest(
      null,
      user,
      undefined,
      contextFor(req, res),
    );

    expect(result).toEqual(user);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
