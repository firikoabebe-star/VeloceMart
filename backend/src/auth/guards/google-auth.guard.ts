import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import {
  buildErrorRedirect,
  generateOAuthState,
  getAllowedOrigins,
  getFrontendRedirectBase,
  isGoogleOAuthConfigured,
  isProduction,
  resolveFrontendOrigin,
  setOAuthStateCookies,
} from '../google-oauth.util.js';

// Starts the Google OAuth flow. Generates a random `state`, pins it (and the
// validated return origin) to short-lived httpOnly cookies, and forwards the
// state to Google so the callback can be matched against this browser.
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!isGoogleOAuthConfigured(this.config)) {
      const req = context.switchToHttp().getRequest<Request>();
      const res = context.switchToHttp().getResponse<Response>();
      const origin = resolveFrontendOrigin(req, getAllowedOrigins(this.config));
      res.redirect(buildErrorRedirect(getFrontendRedirectBase(this.config), 'not_configured'));
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const state = generateOAuthState();
    const origin = resolveFrontendOrigin(req, getAllowedOrigins(this.config));
    setOAuthStateCookies(res, state, origin, isProduction(this.config));

    return { scope: ['email', 'profile'], state };
  }
}
