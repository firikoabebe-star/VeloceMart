import type { Response } from 'express';
import { AuthController } from './auth.controller.js';
import type { AuthService } from './auth.service.js';
import type { GoogleCallbackRequest } from './google-oauth.util.js';

type MockResponse = {
  redirect: jest.Mock<void, [string]>;
};

describe('AuthController Google callback', () => {
  let completeGoogleLogin: jest.Mock;
  let controller: AuthController;

  beforeEach(() => {
    completeGoogleLogin = jest.fn();
    controller = new AuthController({
      completeGoogleLogin,
      getConfigValue: jest.fn((key: string) => {
        if (key === 'FRONTEND_REDIRECT_URL') return 'https://velocemart.base.et';
        return undefined;
      }),
    } as unknown as AuthService);
  });

  it('sets cookies and redirects to the frontend without exposing tokens', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'CUSTOMER',
      tokenVersion: 0,
    };
    const req = {
      user,
      frontendRedirect: 'https://velocemart.base.et',
    } as GoogleCallbackRequest;
    const res: MockResponse = { redirect: jest.fn<void, [string]>() };

    controller.googleCallback(req, res as unknown as Response);

    expect(completeGoogleLogin).toHaveBeenCalledWith(user, res);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    const location = res.redirect.mock.calls[0][0];
    expect(location).toBe('https://velocemart.base.et/account');
    expect(location).not.toContain('access_token');
    expect(location).not.toContain('refresh_token');
    expect(location.toLowerCase()).not.toContain('token');
  });

  it('does nothing when the guard already redirected on failure', () => {
    const req = { user: null } as GoogleCallbackRequest;
    const res: MockResponse = { redirect: jest.fn<void, [string]>() };

    controller.googleCallback(req, res as unknown as Response);

    expect(completeGoogleLogin).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('falls back to the default frontend origin when none was stored', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'CUSTOMER',
      tokenVersion: 0,
    };
    const req = { user } as GoogleCallbackRequest;
    const res: MockResponse = { redirect: jest.fn<void, [string]>() };
    const controller2 = new AuthController({
      completeGoogleLogin,
      getConfigValue: jest.fn(() => undefined),
    } as unknown as AuthService);

    controller2.googleCallback(req, res as unknown as Response);

    expect(res.redirect.mock.calls[0][0]).toBe(
      'http://localhost:3000/account',
    );
  });
});
