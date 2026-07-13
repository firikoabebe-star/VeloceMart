import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import type { Request } from 'express';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['access_token'] as string | null,
      ]),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET')!,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): { sub: string; email: string; role: string } {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
