import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeminiService } from './gemini.service.js';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verify Gemini API key connectivity' })
  @ApiResponse({ status: 200, description: 'API key works' })
  @ApiResponse({ status: 503, description: 'API key invalid or unreachable' })
  health() {
    return this.geminiService.healthCheck();
  }
}
