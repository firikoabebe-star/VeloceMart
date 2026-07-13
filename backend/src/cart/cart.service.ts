import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) return cart;
    return this.prisma.cart.create({ data: { userId } });
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
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
            stock: true,
            size: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.productVariant.price) * item.quantity,
      0,
    );

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount,
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.productVariantId },
      include: { product: { select: { id: true, deletedAt: true } } },
    });

    if (!variant || variant.product.deletedAt) {
      throw new NotFoundException('Product variant not found');
    }

    if (variant.product.id !== dto.productId) {
      throw new BadRequestException(
        'Variant does not belong to the specified product',
      );
    }

    if (variant.stock < dto.quantity) {
      throw new ConflictException(
        `Insufficient stock. Available: ${variant.stock}`,
      );
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: dto.productVariantId,
        },
      },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (newQty > variant.stock) {
        throw new ConflictException(
          `Cannot add ${dto.quantity} more. Only ${variant.stock - existing.quantity} additional units available.`,
        );
      }
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          productVariantId: dto.productVariantId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { productVariant: { select: { stock: true } } },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > item.productVariant.stock) {
      throw new ConflictException(
        `Insufficient stock. Available: ${item.productVariant.stock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }
}
