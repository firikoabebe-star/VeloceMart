import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service.js';
import { AiController } from './ai.controller.js';

@Module({
  controllers: [AiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class AiModule {}
