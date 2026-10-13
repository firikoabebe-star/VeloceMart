import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  DEFAULT_FRONTEND_ORIGIN,
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
} from './google-oauth.constants.js';
import {
  buildFrontendRedirect,
  consumeOAuthState,
  getAllowedOrigins,
  getRequestOrigin,
  isGoogleOAuthConfigured,
  resolveFrontendOrigin,
} from './google-oauth.util.js';

const configWith = (values: Record<string, unknown>): ConfigService =>
  ({ get: jest.fn((key: string) => values[key]) }) as unknown as ConfigService;

describe('google-oauth util', () => {
  describe('getAllowedOrigins', () => {
    it('splits, trims and drops empty comma-separated origins', () => {
      const config = configWith({
        FRONTEND_URL:
          'https://a.example, https://b.example ,,https://c.example',
      });
      expect(getAllowedOrigins(config)).toEqual([
        'https://a.example',
        'https://b.example',
        'https://c.example',
      ]);
    });

    it('falls back to the default origin when unset', () => {
      expect(getAllowedOrigins(configWith({}))).toEqual([
        DEFAULT_FRONTEND_ORIGIN,
      ]);
    });
  });

  describe('isGoogleOAuthConfigured', () => {
    it('requires client id, secret and callback url', () => {
      expect(isGoogleOAuthConfigured(configWith({}))).toBe(false);
      expect(
        isGoogleOAuthConfigured(
          configWith({
            GOOGLE_CLIENT_ID: 'id',
            GOOGLE_CLIENT_SECRET: 'secret',
          }),
        ),
      ).toBe(false);
      expect(
        isGoogleOAuthConfigured(
          configWith({
            GOOGLE_CLIENT_ID: 'id',
            GOOGLE_CLIENT_SECRET: 'secret',
            GOOGLE_CALLBACK_URL: 'https://backend/api/auth/google/callback',
          }),
        ),
      ).toBe(true);
    });
  });

  describe('getRequestOrigin / resolveFrontendOrigin', () => {
    it('prefers the Origin header', () => {
      const req = {
        headers: { origin: 'https://front.example' },
      } as unknown as Request;
      expect(getRequestOrigin(req)).toBe('https://front.example');
    });

    it('falls back to the Referer origin', () => {
      const req = {
        headers: { referer: 'https://front.example/path?x=1' },
      } as unknown as Request;
      expect(getRequestOrigin(req)).toBe('https://front.example');
    });

    it('never redirects to an origin outside the allow-list', () => {
      const req = {
        headers: { origin: 'https://evil.example' },
      } as unknown as Request;
      expect(resolveFrontendOrigin(req, ['https://front.example'])).toBe(
        'https://front.example',
      );
    });

    it('uses the same-request origin when allow-listed', () => {
      const req = {
        headers: { origin: 'https://front.example' },
      } as unknown as Request;
      expect(
        resolveFrontendOrigin(req, [
          'https://a.example',
          'https://front.example',
        ]),
      ).toBe('https://front.example');
    });
  });

  describe('consumeOAuthState', () => {
    const allowed = ['https://front.example'];

    it('accepts a matching state and a valid redirect origin', () => {
      const req = {
        cookies: {
          [OAUTH_STATE_COOKIE]: 'nonce',
          [OAUTH_REDIRECT_COOKIE]: 'https://front.example',
        },
        query: { state: 'nonce' },
      };
      expect(consumeOAuthState(req, allowed)).toEqual({
        valid: true,
        redirectOrigin: 'https://front.example',
      });
    });

    it('rejects a missing state cookie', () => {
      const req = {
        cookies: { [OAUTH_REDIRECT_COOKIE]: 'https://front.example' },
        query: { state: 'nonce' },
      };
      expect(consumeOAuthState(req, allowed).valid).toBe(false);
    });

    it('rejects a mismatched state', () => {
      const req = {
        cookies: { [OAUTH_STATE_COOKIE]: 'nonce' },
        query: { state: 'other' },
      };
      expect(consumeOAuthState(req, allowed).valid).toBe(false);
    });

    it('ignores a tampered redirect cookie and falls back to the allow-list', () => {
      const req = {
        cookies: {
          [OAUTH_STATE_COOKIE]: 'nonce',
          [OAUTH_REDIRECT_COOKIE]: 'https://evil.example',
        },
        query: { state: 'nonce' },
      };
      expect(consumeOAuthState(req, allowed)).toEqual({
        valid: true,
        redirectOrigin: 'https://front.example',
      });
    });
  });

  describe('buildFrontendRedirect', () => {
    it('adds only a non-sensitive success flag', () => {
      const url = buildFrontendRedirect('https://front.example', {
        google: 'success',
      });
      expect(url).toBe('https://front.example/auth/login?google=success');
    });

    it('adds a safe error reason without any token material', () => {
      const url = buildFrontendRedirect('https://front.example', {
        google: 'error',
        reason: 'account_conflict',
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.get('google')).toBe('error');
      expect(parsed.searchParams.get('reason')).toBe('account_conflict');
      expect(url.toLowerCase()).not.toContain('token');
      expect(url).not.toContain('access_token');
      expect(url).not.toContain('refresh_token');
    });
  });
});
