import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';
import { CartService } from './cart.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart with totals' })
  @ApiResponse({
    status: 200,
    description: 'Cart with items, counts, and total',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add item to cart (merges if variant already present)',
  })
  @ApiResponse({ status: 201, description: 'Item added, returns updated cart' })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  addItem(@Req() req: AuthenticatedRequest, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.sub, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'itemId', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Item updated, returns updated cart',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Item removed, returns updated cart',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(req.user.sub, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  clearCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.clearCart(req.user.sub);
  }
}
