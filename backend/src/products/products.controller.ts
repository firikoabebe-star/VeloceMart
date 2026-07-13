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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProductsService } from './products.service.js';
import {
  CreateProductDto,
  ProductFilterDto,
  SearchProductsDto,
  UpdateProductDto,
} from './dto/product.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List products with filtering, sorting, pagination',
  })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'color', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'slug', 'createdAt', 'updatedAt', 'category'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search products by keyword in name and description',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search keyword' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'slug', 'createdAt', 'updatedAt', 'category'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Paginated search results' })
  @ApiResponse({ status: 400, description: 'Missing or empty search query' })
  search(@Query() dto: SearchProductsDto) {
    return this.productsService.searchProducts(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with variants' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product restored' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.restore(id);
  }

  @Get(':id/recommendations')
  @ApiOperation({
    summary: 'Get AI-powered product recommendations',
    description:
      'Uses Gemini to suggest complementary products from the catalog. ' +
      'Falls back to same-category results if AI is unavailable.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Up to 3 recommended products' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getRecommendations(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getRecommendations(id);
  }

  @Post(':id/generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate an AI product description (admin only)',
    description:
      'Sends product details to Gemini and returns a professional, ' +
      'SEO-friendly description. The generated text is returned for ' +
      'review and is NOT automatically saved.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Generated description returned' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 503,
    description: 'AI service unavailable or API key not configured',
  })
  generateDescription(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.generateDescription(id);
  }
}
