import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service.js';
import { isGoogleOAuthConfigured } from '../google-oauth.util.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') ??
      'http://localhost:3001/api/auth/google/callback';

    if (!isGoogleOAuthConfigured(config)) {
      // Keep the application bootable when Google OAuth is not configured; the
      // /auth/google route returns a friendly frontend error instead.
      new Logger(GoogleStrategy.name).warn(
        'Google OAuth is not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_CALLBACK_URL missing)',
      );
    }

    super({
      clientID: clientID ?? 'google-oauth-not-configured',
      clientSecret: clientSecret ?? 'google-oauth-not-configured',
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  // The Nest Passport mixin wraps this method and calls the strategy's `done`
  // callback itself, so the result is returned (or thrown) rather than passed
  // to a callback here. Only a verified Google email is ever accepted.
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    return this.authService.validateGoogleUser(profile);
  }
}
