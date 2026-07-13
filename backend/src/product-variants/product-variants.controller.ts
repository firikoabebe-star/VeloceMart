import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service.js';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  VariantFilterDto,
} from './dto/product-variant.dto.js';

@ApiTags('Product Variants')
@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(private readonly variantsService: ProductVariantsService) {}

  @Get()
  @ApiOperation({ summary: 'List variants for a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'color', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'inStock', required: false, enum: ['true', 'false'] })
  @ApiResponse({ status: 200, description: 'Variant list' })
  findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() filters: VariantFilterDto,
  ) {
    return this.variantsService.findByProduct(productId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Variant found' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product variant' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Variant created' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.variantsService.create({ ...dto, productId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Variant updated' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.variantsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product variant' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Variant deleted' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantsService.remove(id);
  }

  @Patch(':id/stock')
  @ApiOperation({
    summary: 'Adjust variant stock (positive to add, negative to subtract)',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Stock updated' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.variantsService.updateStock(id, quantity);
  }
}
