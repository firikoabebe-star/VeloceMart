import { Module } from '@nestjs/common';
import { ProductVariantsController } from './product-variants.controller.js';
import { ProductVariantsService } from './product-variants.service.js';

@Module({
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
