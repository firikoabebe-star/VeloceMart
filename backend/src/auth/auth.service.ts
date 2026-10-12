import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import type { Response } from 'express';
import { OtpPurpose } from '../../generated/prisma';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { EmailService } from './email.service.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 12;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing && existing.emailVerified) {
      throw new ConflictException('Email already registered');
    }

    // An unverified account with this email is reused rather than duplicated:
    // a previous registration may have persisted the user but failed to deliver
    // its OTP. Credentials and profile fields are never overwritten here, so a
    // retry cannot be used to hijack an account that has not been verified yet.
    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          email: dto.email,
          password: await bcrypt.hash(dto.password, SALT_ROUNDS),
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role ?? 'CUSTOMER',
          emailVerified: false,
        },
      }));

    // Persistence and delivery are handled separately: a database failure is
    // never reported to the client as a successful registration, and an email
    // failure is reported as a retryable, provider-agnostic error.
    let code: string;
    try {
      code = await this.createOtp(user.id, OtpPurpose.EMAIL_VERIFICATION);
    } catch (error) {
      this.logger.error(
        `Registration OTP persistence failed (${this.safeErrorName(error)})`,
      );
      throw new ServiceUnavailableException(
        'Unable to complete registration. Please try again.',
      );
    }

    try {
      await this.emailService.sendOtpEmail(user.email, code);
    } catch (error) {
      this.logger.error(
        `Registration OTP delivery failed (${this.safeErrorName(error)})`,
      );
      // The user and OTP are still persisted, so registration can be retried
      // (or the code resent) once email delivery recovers.
      throw new ServiceUnavailableException(
        'We could not send the verification email. Please try again.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      message:
        'Registration successful. Check your email for the verification code.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = await this.prisma.emailOtp.findFirst({
      where: {
        userId: user.id,
        used: false,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== dto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.emailOtp.updateMany({
        where: { id: otp.id, used: false },
        data: { used: true },
      });

      if (claimed.count === 0) {
        throw new BadRequestException('Invalid verification code');
      }

      return tx.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    });

    this.setTokenCookies(
      res,
      updatedUser.id,
      updatedUser.email,
      updatedUser.role,
      updatedUser.tokenVersion,
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const message =
      'If an account with that email exists and is unverified, a new verification code has been sent.';

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || user.emailVerified) {
      return { message };
    }

    // Issue and deliver independently: a database failure must not be confused
    // with — or masked as — an email delivery failure. Both paths keep the
    // response generic so callers cannot probe account existence, and the user
    // can always retry without database or operator intervention.
    let code: string;
    try {
      code = await this.createOtp(user.id, OtpPurpose.EMAIL_VERIFICATION);
    } catch (error) {
      this.logger.error(
        `Resend OTP persistence failed (${this.safeErrorName(error)})`,
      );
      return { message };
    }

    try {
      await this.emailService.sendOtpEmail(user.email, code);
    } catch (error) {
      this.logger.error(
        `Resend OTP delivery failed (${this.safeErrorName(error)})`,
      );
    }

    return { message };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // Always the same response: an attacker must not be able to tell whether an
    // email is registered from the status, body, or timing-independent message.
    const message =
      'If an account with that email exists, a password reset code has been sent.';

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      return { message };
    }

    let code: string;
    try {
      code = await this.createOtp(user.id, OtpPurpose.PASSWORD_RESET);
    } catch (error) {
      this.logger.error(
        `Password reset OTP persistence failed (${this.safeErrorName(error)})`,
      );
      return { message };
    }

    try {
      await this.emailService.sendPasswordResetEmail(user.email, code);
    } catch (error) {
      this.logger.error(
        `Password reset OTP delivery failed (${this.safeErrorName(error)})`,
      );
    }

    return { message };
  }

  async resetPassword(dto: ResetPasswordDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    const otp = await this.prisma.emailOtp.findFirst({
      where: { userId: user.id, purpose: OtpPurpose.PASSWORD_RESET },
      orderBy: { createdAt: 'desc' },
    });

    // Checked in a deliberate order so the client gets a clear, specific
    // reason without those reasons revealing whether the account exists.
    if (!otp || otp.code !== dto.code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (otp.used) {
      throw new BadRequestException('Verification code has already been used');
    }
    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    const hashed = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.emailOtp.updateMany({
        where: { id: otp.id, used: false },
        data: { used: true },
      });

      if (claimed.count === 0) {
        throw new BadRequestException(
          'Verification code has already been used',
        );
      }

      // Bumping tokenVersion invalidates every previously issued access and
      // refresh token for this user, forcing a fresh login on all devices.
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          tokenVersion: { increment: 1 },
        },
      });
    });

    // Also log out the device that performed the reset.
    this.clearTokenCookies(res);

    return {
      message:
        'Password reset successful. Please log in with your new password.',
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    this.setTokenCookies(
      res,
      user.id,
      user.email,
      user.role,
      user.tokenVersion,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  refresh(
    userId: string,
    email: string,
    role: string,
    tokenVersion: number,
    res: Response,
  ) {
    this.setTokenCookies(res, userId, email, role, tokenVersion);
    return { message: 'Tokens refreshed' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return user;
  }

  logout(res: Response) {
    this.clearTokenCookies(res);
    return { message: 'Logged out' };
  }

  private async createOtp(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<string> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.prisma.$transaction(async (tx) => {
      // Lock the user row for the duration of the transaction so concurrent
      // OTP issuance (register vs. resend, or two resets) is serialized.
      // The second transaction then invalidates the first's unused code
      // before inserting its own, guaranteeing at most one unused code.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      // Only codes for the same purpose are invalidated, so requesting a
      // password reset never cancels a pending email-verification code (or
      // vice versa).
      await tx.emailOtp.updateMany({
        where: { userId, used: false, purpose },
        data: { used: true },
      });

      await tx.emailOtp.create({
        data: { userId, code, expiresAt, purpose },
      });
    });

    return code;
  }

  // Returns a bounded, PII-free error category for operational logs. Provider
  // payloads, recipient addresses and OTP values are intentionally excluded.
  private safeErrorName(error: unknown): string {
    if (error && typeof error === 'object' && 'name' in error) {
      const name = (error as { name?: unknown }).name;
      if (typeof name === 'string' && name.length > 0) {
        return name.slice(0, 64);
      }
    }
    return 'UnknownError';
  }

  private setTokenCookies(
    res: Response,
    sub: string,
    email: string,
    role: string,
    tokenVersion: number,
  ) {
    const payload: JwtPayload = {
      sub,
      email,
      role: role as JwtPayload['role'],
      ver: tokenVersion,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    const isProduction = this.config.get('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // The route lives under the global "api" prefix, so a cookie scoped to
      // "/auth/refresh" would never be sent to "/api/auth/refresh". Use "/" so
      // the refresh cookie honours the configured base path.
      path: '/',
    });
  }

  private clearTokenCookies(res: Response) {
    const isProduction = this.config.get('NODE_ENV') === 'production';

    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
  }
}
