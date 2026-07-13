import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role, OrderStatus } from '../../generated/prisma/enums.js';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';
import { OrdersService } from './orders.service.js';
import { OrderFilterDto } from './dto/order.dto.js';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout: convert cart to order with stock validation',
  })
  @ApiResponse({ status: 201, description: 'Order created from cart' })
  @ApiResponse({ status: 400, description: 'Cart is empty' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  checkout(@Req() req: AuthenticatedRequest) {
    return this.ordersService.checkout(req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get order history (paginated)' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'totalAmount', 'status'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  findAll(@Req() req: AuthenticatedRequest, @Query() filters: OrderFilterDto) {
    return this.ordersService.findAll(req.user.sub, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order with items' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findOne(req.user.sub, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'status', required: true, enum: OrderStatus })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden (not admin)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'List all orders across users (admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'totalAmount', 'status'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'All orders paginated' })
  findAllAdmin(@Query() filters: OrderFilterDto) {
    return this.ordersService.findAllAdmin(filters);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/stats')
  @ApiOperation({ summary: 'Get order statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Order stats' })
  getAdminStats() {
    return this.ordersService.getAdminStats();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get any order by ID (admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order with items and user' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOneAdmin(id);
  }
}
