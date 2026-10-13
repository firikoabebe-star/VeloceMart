import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ContactService } from './contact.service.js';
import { ContactMessageDto } from './dto/contact.dto.js';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Whether the contact form can currently deliver messages',
  })
  @ApiResponse({ status: 200, description: 'Contact form availability' })
  status() {
    return { available: this.contactService.isConfigured() };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 5, ttl: 60_000 },
    email: { limit: 3, ttl: 60_000 },
  })
  @Post()
  @ApiOperation({ summary: 'Submit a contact form message' })
  @ApiResponse({ status: 200, description: 'Message accepted for delivery' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({
    status: 503,
    description:
      'Contact delivery is not configured or temporarily unavailable',
  })
  submit(@Body() dto: ContactMessageDto) {
    return this.contactService.submit(dto);
  }
}
