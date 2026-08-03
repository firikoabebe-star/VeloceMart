import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service.js';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            category: { select: { id: true, name: true, slug: true } },
            variants: {
              select: { id: true, price: true, stock: true },
              take: 1,
              orderBy: { price: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    return this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            category: { select: { id: true, name: true, slug: true } },
            variants: {
              select: { id: true, price: true, stock: true },
              take: 1,
              orderBy: { price: 'asc' },
            },
          },
        },
      },
    });
  }

  async remove(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) {
      throw new NotFoundException('Product not in wishlist');
    }

    await this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { success: true };
  }

  async check(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { inWishlist: !!item };
  }
}
