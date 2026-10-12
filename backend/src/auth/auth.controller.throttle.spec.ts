import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Server } from 'http';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { buildThrottlerOptions } from '../common/throttler/throttler.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController registration throttling', () => {
  let app: INestApplication;
  let register: jest.Mock;

  const registration = (email: string) => ({
    email,
    password: 'Password123',
    firstName: 'Test',
    lastName: 'User',
  });

  const postRegister = (email: string) =>
    request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send(registration(email));

  beforeEach(async () => {
    register = jest.fn((dto: { email: string }) =>
      Promise.resolve({ id: 'user-1', email: dto.email, emailVerified: false }),
    );

    const config = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(buildThrottlerOptions(config))],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register,
            resendOtp: jest.fn().mockResolvedValue({ message: 'ok' }),
            verifyEmail: jest.fn().mockResolvedValue({}),
            forgotPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
            resetPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('caps registrations per IP even when the submitted email changes', async () => {
    for (let i = 0; i < 5; i += 1) {
      await postRegister(`rotating-${i}@example.com`).expect(201);
    }

    // A brand-new email key cannot bypass the exhausted IP bucket.
    await postRegister('brand-new@example.com').expect(429);
  });

  it('limits repeated registration of the same normalized email', async () => {
    for (let i = 0; i < 3; i += 1) {
      await postRegister('repeat@example.com').expect(201);
    }

    // The email bucket is exhausted while the IP bucket is only at 4/5.
    await postRegister('repeat@example.com').expect(429);
  });

  it('treats casing and whitespace variants as the same email bucket', async () => {
    for (let i = 0; i < 3; i += 1) {
      await postRegister('Case@Example.com').expect(201);
    }

    await postRegister('  case@example.com  ').expect(429);
  });

  it('does not include the submitted email in throttling errors', async () => {
    for (let i = 0; i < 3; i += 1) {
      await postRegister('private@example.com').expect(201);
    }

    const response = await postRegister('private@example.com').expect(429);
    expect(JSON.stringify(response.body)).not.toContain('private@example.com');
  });

  it('leaves normal registration working below the limits', async () => {
    const response = await postRegister('new@example.com').expect(201);

    expect(response.body).toMatchObject({ email: 'new@example.com' });
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('rate-limits forgot-password per normalized email', async () => {
    const postForgot = (email: string) =>
      request(app.getHttpServer() as Server)
        .post('/auth/forgot-password')
        .send({ email });

    for (let i = 0; i < 3; i += 1) {
      await postForgot('Reset@Example.com').expect(200);
    }

    await postForgot('  reset@example.com  ').expect(429);
  });

  it('rate-limits reset-password requests', async () => {
    const postReset = () =>
      request(app.getHttpServer() as Server)
        .post('/auth/reset-password')
        .send({
          email: 'reset@example.com',
          code: '123456',
          newPassword: 'NewPassword1',
        });

    for (let i = 0; i < 5; i += 1) {
      await postReset().expect(200);
    }

    await postReset().expect(429);
  });
});
