import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { Role } from '../../generated/prisma';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 5, ttl: 60_000 },
    email: { limit: 3, ttl: 60_000 },
  })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered, verification code emailed',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 5, ttl: 60_000 },
    email: { limit: 5, ttl: 60_000 },
  })
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with the 6-digit OTP code' })
  @ApiResponse({
    status: 200,
    description: 'Email verified, sets cookies',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyEmail(dto, res);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend a new verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, sets cookies' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Refresh access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Refresh token missing or invalid' })
  refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(
      req.user.sub,
      req.user.email,
      req.user.role,
      res,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and clear cookies' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin-only route (requires ADMIN role)' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  adminOnly() {
    return { message: 'Admin access granted' };
  }
}
