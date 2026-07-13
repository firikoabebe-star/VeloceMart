import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'] as string | null,
      ]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET')!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: JwtPayload,
  ): { sub: string; email: string; role: string } {
    const refreshToken = req?.cookies?.['refresh_token'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
