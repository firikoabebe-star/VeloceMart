import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { buildThrottlerOptions } from '../common/throttler/throttler.config.js';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { AuthController } from './auth.controller.js';
import { AuthModule } from './auth.module.js';
import { EmailService } from './email.service.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { GoogleCallbackGuard } from './guards/google-callback.guard.js';
import { GoogleStrategy } from './strategies/google.strategy.js';

// Boots the real AuthModule with the database and email providers swapped out,
// ensuring the Google strategy, guards and controller all resolve through DI
// without connecting to an external database.
describe('AuthModule wiring', () => {
  it('resolves the Google strategy, guards and controller', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_ACCESS_SECRET: 'test-access-secret',
              JWT_REFRESH_SECRET: 'test-refresh-secret',
              GOOGLE_CLIENT_ID: 'test-client-id',
              GOOGLE_CLIENT_SECRET: 'test-client-secret',
              GOOGLE_CALLBACK_URL:
                'http://localhost:3001/api/auth/google/callback',
              FRONTEND_URL: 'http://localhost:3000',
            }),
          ],
        }),
        PrismaModule,
        ThrottlerModule.forRoot(
          buildThrottlerOptions({
            get: () => undefined,
          } as unknown as ConfigService),
        ),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({ user: {}, emailOtp: {}, $transaction: jest.fn() })
      .overrideProvider(EmailService)
      .useValue({ sendOtpEmail: jest.fn(), sendPasswordResetEmail: jest.fn() })
      .compile();

    expect(moduleRef.get(GoogleStrategy)).toBeInstanceOf(GoogleStrategy);
    expect(moduleRef.get(GoogleAuthGuard)).toBeInstanceOf(GoogleAuthGuard);
    expect(moduleRef.get(GoogleCallbackGuard)).toBeInstanceOf(
      GoogleCallbackGuard,
    );
    expect(moduleRef.get(AuthController)).toBeInstanceOf(AuthController);

    await moduleRef.close();
  });
});
