import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { OrderStatus } from '../../generated/prisma';
import { PrismaService } from '../common/prisma/prisma.service.js';
import type { PaginatedResponse } from '../common/dto/pagination.dto.js';
import { OrderFilterDto } from './dto/order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              select: { id: true, price: true, stock: true, productId: true },
            },
            product: { select: { id: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock for every item before doing anything
    for (const item of cart.items) {
      if (item.quantity > item.productVariant.stock) {
        throw new ConflictException(
          `Insufficient stock for variant "${item.productVariant.id}". ` +
            `Requested: ${item.quantity}, available: ${item.productVariant.stock}`,
        );
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.productVariant.price) * item.quantity,
      0,
    );

    // Atomic transaction: create order, order items, decrement stock, clear cart
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              productVariantId: item.productVariant.id,
              quantity: item.quantity,
              unitPrice: item.productVariant.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
              productVariant: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  size: true,
                  color: true,
                },
              },
            },
          },
        },
      });

      // Decrement stock for each variant
      for (const item of cart.items) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.productVariant.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            `Stock changed for variant "${item.productVariant.id}". Please retry.`,
          );
        }
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  async findAll(
    userId: string,
    filters: OrderFilterDto,
  ): Promise<PaginatedResponse<object>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status && { status }),
    };

    const allowedSort = [
      'createdAt',
      'updatedAt',
      'totalAmount',
      'status',
    ] as const;
    const field = allowedSort.includes(sortBy as (typeof allowedSort)[number])
      ? sortBy
      : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: sortOrder },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
              productVariant: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  size: true,
                  color: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, imageUrl: true },
            },
            productVariant: {
              select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                size: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    return order;
  }

  async updateStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot transition order from "${order.status}" to "${status}"`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
            productVariant: { select: { id: true, sku: true, name: true } },
          },
        },
      },
    });
  }

  async findAllAdmin(
    filters: OrderFilterDto,
  ): Promise<PaginatedResponse<object>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
    };

    const allowedSort = [
      'createdAt',
      'updatedAt',
      'totalAmount',
      'status',
    ] as const;
    const field = allowedSort.includes(sortBy as (typeof allowedSort)[number])
      ? sortBy
      : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: sortOrder },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
              productVariant: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  size: true,
                  color: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneAdmin(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, imageUrl: true },
            },
            productVariant: {
              select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                size: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    return order;
  }

  async getAdminStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, pendingOrders, revenueResult] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      monthlyRevenue: Number(revenueResult._sum.totalAmount ?? 0),
    };
  }

  async getMyStats(userId: string) {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [totalOrders, activeOrders, pendingOrders, deliveredOrders, cancelledOrders, spentResult, statusCounts, monthlySpending] =
      await Promise.all([
        this.prisma.order.count({ where: { userId } }),
        this.prisma.order.count({
          where: { userId, status: { in: ['PENDING', 'CONFIRMED', 'SHIPPED'] } },
        }),
        this.prisma.order.count({ where: { userId, status: 'PENDING' } }),
        this.prisma.order.count({ where: { userId, status: 'DELIVERED' } }),
        this.prisma.order.count({ where: { userId, status: 'CANCELLED' } }),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { userId, status: { not: 'CANCELLED' } },
        }),
        this.prisma.order.groupBy({
          by: ['status'],
          where: { userId },
          _count: true,
        }),
        this.prisma.$queryRaw<{ month: string; total: number }[]>`
          SELECT
            TO_CHAR(o.created_at, 'YYYY-MM') AS month,
            COALESCE(SUM(o.total_amount), 0)::float AS total
          FROM orders o
          WHERE o.user_id = ${userId}
            AND o.created_at >= ${twelveMonthsAgo}
            AND o.status != 'CANCELLED'
          GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
          ORDER BY month ASC
        `,
      ]);

    const totalSpent = Number(spentResult._sum.totalAmount ?? 0);

    const orderStatusBreakdown: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const item of statusCounts) {
      orderStatusBreakdown[item.status] = item._count;
    }

    const spendingOverTime = monthlySpending.map((row) => ({
      month: row.month,
      total: Number(row.total),
    }));

    return {
      totalOrders,
      totalSpent,
      activeOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      orderStatusBreakdown,
      spendingOverTime,
    };
  }
}
