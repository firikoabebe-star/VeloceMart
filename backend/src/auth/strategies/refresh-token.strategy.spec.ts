import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Role } from '../../../generated/prisma';
import type { PrismaService } from '../../common/prisma/prisma.service.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { RefreshTokenStrategy } from './refresh-token.strategy.js';

type StrategyUser = {
  id: string;
  email: string;
  role: Role;
  tokenVersion: number;
};

describe('RefreshTokenStrategy', () => {
  const config = {
    get: jest.fn(() => 'test-secret'),
  } as unknown as ConfigService;

  const build = (user: StrategyUser | null): RefreshTokenStrategy => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
    } as unknown as PrismaService;
    return new RefreshTokenStrategy(config, prisma);
  };

  const request = (): Request =>
    ({ cookies: { refresh_token: 'token' } }) as unknown as Request;

  const payload = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
    sub: 'user-1',
    email: 'user@example.com',
    role: Role.CUSTOMER,
    ver: 0,
    ...overrides,
  });

  it('accepts a refresh token whose version matches the user', async () => {
    const strategy = build({
      id: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      tokenVersion: 0,
    });

    await expect(strategy.validate(request(), payload())).resolves.toEqual({
      sub: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      ver: 0,
    });
  });

  it('rejects when the refresh cookie is missing', async () => {
    const strategy = build({
      id: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      tokenVersion: 0,
    });

    await expect(
      strategy.validate({ cookies: {} } as unknown as Request, payload()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token issued before the version was bumped', async () => {
    const strategy = build({
      id: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      tokenVersion: 2,
    });

    await expect(
      strategy.validate(request(), payload({ ver: 1 })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token that lacks the version claim', async () => {
    const strategy = build({
      id: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      tokenVersion: 0,
    });
    const legacy = {
      sub: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
    } as unknown as JwtPayload;

    await expect(strategy.validate(request(), legacy)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token for a deleted user', async () => {
    const strategy = build(null);

    await expect(
      strategy.validate(request(), payload()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
