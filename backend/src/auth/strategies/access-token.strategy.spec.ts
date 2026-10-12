import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../generated/prisma';
import type { PrismaService } from '../../common/prisma/prisma.service.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { AccessTokenStrategy } from './access-token.strategy.js';

type StrategyUser = {
  id: string;
  email: string;
  role: Role;
  tokenVersion: number;
};

describe('AccessTokenStrategy', () => {
  const config = {
    get: jest.fn(() => 'test-secret'),
  } as unknown as ConfigService;

  const build = (user: StrategyUser | null): AccessTokenStrategy => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
    } as unknown as PrismaService;
    return new AccessTokenStrategy(config, prisma);
  };

  const payload = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
    sub: 'user-1',
    email: 'user@example.com',
    role: Role.CUSTOMER,
    ver: 0,
    ...overrides,
  });

  it('accepts a token whose version matches the user', async () => {
    const strategy = build({
      id: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      tokenVersion: 0,
    });

    await expect(strategy.validate(payload())).resolves.toEqual({
      sub: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      ver: 0,
    });
  });

  it('rejects a token issued before the version was bumped', async () => {
    const strategy = build({
      id: 'user-1',
      email: 'user@example.com',
      role: Role.CUSTOMER,
      tokenVersion: 1,
    });

    await expect(strategy.validate(payload({ ver: 0 }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
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

    await expect(strategy.validate(legacy)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token for a deleted user', async () => {
    const strategy = build(null);

    await expect(strategy.validate(payload())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
