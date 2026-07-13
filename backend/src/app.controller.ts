import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }
}
