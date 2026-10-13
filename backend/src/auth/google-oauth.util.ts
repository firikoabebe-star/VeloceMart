import { randomBytes, timingSafeEqual } from 'crypto';
import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  DEFAULT_FRONTEND_ORIGIN,
  GOOGLE_AUTH_FRONTEND_PATH,
  OAUTH_COOKIE_MAX_AGE_MS,
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
} from './google-oauth.constants.js';

export interface GoogleAuthUser {
  id: string;
  email: string;
  role: string;
  tokenVersion: number;
}

export interface GoogleCallbackRequest extends Omit<Request, 'user'> {
  user?: GoogleAuthUser | null;
  // Origin the browser should be sent back to, resolved and validated when the
  // flow started.
  frontendRedirect?: string;
}

export interface GoogleRedirectSuccess {
  google: 'success';
}

export interface GoogleRedirectError {
  google: 'error';
  reason: string;
}

export type GoogleRedirectParams = GoogleRedirectSuccess | GoogleRedirectError;

export function getAllowedOrigins(config: ConfigService): string[] {
  const raw = config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_ORIGIN;
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return origins.length > 0 ? origins : [DEFAULT_FRONTEND_ORIGIN];
}

export function isProduction(config: ConfigService): boolean {
  return config.get('NODE_ENV') === 'production';
}

export function isGoogleOAuthConfigured(config: ConfigService): boolean {
  return (
    typeof config.get<string>('GOOGLE_CLIENT_ID') === 'string' &&
    config.get<string>('GOOGLE_CLIENT_ID')!.length > 0 &&
    typeof config.get<string>('GOOGLE_CLIENT_SECRET') === 'string' &&
    config.get<string>('GOOGLE_CLIENT_SECRET')!.length > 0 &&
    typeof config.get<string>('GOOGLE_CALLBACK_URL') === 'string' &&
    config.get<string>('GOOGLE_CALLBACK_URL')!.length > 0
  );
}

// Reads the browser origin from the request, preferring the `Origin` header and
// falling back to the `Referer`. Only used to validate against the allow-list,
// never trusted directly.
export function getRequestOrigin(
  req: Pick<Request, 'headers'>,
): string | undefined {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.length > 0) {
    return origin;
  }
  const referer = req.headers.referer;
  if (typeof referer === 'string' && referer.length > 0) {
    try {
      return new URL(referer).origin;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Picks where to send the user after the flow. A same-request origin is only
// accepted when it is on the configured allow-list, otherwise the first
// configured origin is used. This prevents an attacker from turning the OAuth
// redirect into an open redirect.
export function resolveFrontendOrigin(
  req: Pick<Request, 'headers'>,
  allowedOrigins: string[],
): string {
  const candidate = getRequestOrigin(req);
  if (candidate && allowedOrigins.includes(candidate)) {
    return candidate;
  }
  return allowedOrigins[0] ?? DEFAULT_FRONTEND_ORIGIN;
}

export function generateOAuthState(): string {
  return randomBytes(32).toString('base64url');
}

function cookieOptions(secure: boolean, maxAge?: number) {
  return {
    httpOnly: true,
    secure,
    // The callback is a top-level navigation from Google, so a Lax cookie is
    // still sent. Lax is preferred over None for the transient OAuth state to
    // reduce exposure.
    sameSite: 'lax' as const,
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export function setOAuthStateCookies(
  res: Response,
  state: string,
  redirectOrigin: string,
  secure: boolean,
): void {
  res.cookie(
    OAUTH_STATE_COOKIE,
    state,
    cookieOptions(secure, OAUTH_COOKIE_MAX_AGE_MS),
  );
  res.cookie(
    OAUTH_REDIRECT_COOKIE,
    redirectOrigin,
    cookieOptions(secure, OAUTH_COOKIE_MAX_AGE_MS),
  );
}

export function clearOAuthStateCookies(res: Response, secure: boolean): void {
  const options = cookieOptions(secure);
  res.clearCookie(OAUTH_STATE_COOKIE, options);
  res.clearCookie(OAUTH_REDIRECT_COOKIE, options);
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}

// Compares the `state` query parameter returned by Google with the httpOnly
// cookie set when the flow started. Always resolves the redirect origin to an
// allow-listed value, even when the cookie is missing or tampered with.
export function consumeOAuthState(
  req: Pick<Request, 'cookies' | 'query'>,
  allowedOrigins: string[],
): { valid: boolean; redirectOrigin: string } {
  const cookies = (req.cookies ?? {}) as Record<string, unknown>;
  const expected = cookies[OAUTH_STATE_COOKIE];
  const provided = req.query?.state;
  const storedRedirect = cookies[OAUTH_REDIRECT_COOKIE];

  const redirectOrigin =
    typeof storedRedirect === 'string' &&
    allowedOrigins.includes(storedRedirect)
      ? storedRedirect
      : (allowedOrigins[0] ?? DEFAULT_FRONTEND_ORIGIN);

  const valid =
    typeof expected === 'string' &&
    expected.length > 0 &&
    typeof provided === 'string' &&
    provided.length > 0 &&
    safeEqual(expected, provided);

  return { valid, redirectOrigin };
}

export function buildFrontendRedirect(
  origin: string,
  params: GoogleRedirectParams,
): string {
  const url = new URL(GOOGLE_AUTH_FRONTEND_PATH, origin);
  url.searchParams.set('google', params.google);
  if (params.google === 'error') {
    url.searchParams.set('reason', params.reason);
  }
  return url.toString();
}

export function getFrontendRedirectBase(config: ConfigService): string {
  const base =
    config.get<string>('FRONTEND_REDIRECT_URL') ??
    config.get<string>('FRONTEND_URL') ??
    DEFAULT_FRONTEND_ORIGIN;
  const first = base.split(',')[0].trim();
  return first || DEFAULT_FRONTEND_ORIGIN;
}

export function buildFrontendRedirectWithPath(
  baseUrl: string,
  path: string,
): string {
  try {
    const url = new URL(path, baseUrl);
    return url.toString();
  } catch {
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }
}

export function buildErrorRedirect(baseUrl: string, code: string): string {
  return buildFrontendRedirectWithPath(baseUrl, `/auth/login?error=${code}`);
}
