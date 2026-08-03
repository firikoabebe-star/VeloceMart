import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { WishlistService } from './wishlist.service.js';
import { AddWishlistItemDto } from './dto/wishlist.dto.js';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist items' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.wishlistService.findAll(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Added to wishlist' })
  @ApiResponse({ status: 409, description: 'Already in wishlist' })
  add(@Req() req: AuthenticatedRequest, @Body() dto: AddWishlistItemDto) {
    return this.wishlistService.add(req.user.sub, dto.productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Removed from wishlist' })
  @ApiResponse({ status: 404, description: 'Not in wishlist' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.remove(req.user.sub, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Check result' })
  check(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.check(req.user.sub, productId);
  }
}
