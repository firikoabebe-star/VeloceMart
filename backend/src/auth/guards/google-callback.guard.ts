import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { GoogleOAuthError } from '../google-oauth.error.js';
import {
  buildErrorRedirect,
  clearOAuthStateCookies,
  consumeOAuthState,
  getAllowedOrigins,
  getFrontendRedirectBase,
  isProduction,
  type GoogleCallbackRequest,
} from '../google-oauth.util.js';

// Finishes the Google OAuth flow. Validates the `state` against the cookie set
// when the flow started, then lets Passport exchange the code and resolve the
// user. Every failure is turned into a redirect back to the frontend with a
// short, non-sensitive reason instead of a JSON error or a token in the URL.
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleCallbackGuard.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<GoogleCallbackRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    const { valid, redirectOrigin } = consumeOAuthState(
      req,
      getAllowedOrigins(this.config),
    );
    req.frontendRedirect = redirectOrigin;
    clearOAuthStateCookies(res, isProduction(this.config));

    if (!valid) {
      this.redirectError(res, redirectOrigin, 'state_mismatch');
      return true;
    }

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      // Passport itself failed before/around the verify callback. Log only the
      // error category so provider payloads never reach the logs.
      this.logger.error(
        `Google callback failed (${this.safeErrorName(error)})`,
      );
      this.redirectError(res, redirectOrigin, 'oauth_failed');
      return true;
    }
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const req = context.switchToHttp().getRequest<GoogleCallbackRequest>();
      const res = context.switchToHttp().getResponse<Response>();
      const redirectOrigin =
        req.frontendRedirect ?? getAllowedOrigins(this.config)[0];
      this.redirectError(res, redirectOrigin, this.errorCode(err, info));
      return null as TUser;
    }
    return user;
  }

  private errorCode(err: unknown, info: unknown): string {
    if (err instanceof GoogleOAuthError) {
      return err.code;
    }
    if (err) {
      return 'oauth_failed';
    }
    const message = (info as { message?: unknown } | undefined)?.message;
    if (message === 'access_denied') {
      return 'access_denied';
    }
    return 'oauth_failed';
  }

  private redirectError(res: Response, origin: string, reason: string): void {
    if (res.headersSent) {
      return;
    }
    const base = getFrontendRedirectBase(this.config);
    res.redirect(buildErrorRedirect(base, reason));
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
