import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  VariantFilterDto,
} from './dto/product-variant.dto.js';

@Injectable()
export class ProductVariantsService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string, filters: VariantFilterDto) {
    const { size, color, minPrice, maxPrice, inStock } = filters;

    const where: Prisma.ProductVariantWhereInput = {
      productId,
      ...(size && { size: { equals: size, mode: 'insensitive' } }),
      ...(color && { color: { equals: color, mode: 'insensitive' } }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {}),
      ...(inStock === 'true' ? { stock: { gt: 0 } } : {}),
    };

    return this.prisma.productVariant.findMany({
      where,
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, categoryId: true },
        },
      },
    });
    if (!variant) {
      throw new NotFoundException(`Product variant with id "${id}" not found`);
    }
    return variant;
  }

  async create(dto: CreateProductVariantDto) {
    await this.prisma.product
      .findFirstOrThrow({
        where: { id: dto.productId, deletedAt: null },
      })
      .catch(() => {
        throw new NotFoundException(
          `Product with id "${dto.productId}" not found`,
        );
      });

    try {
      return await this.prisma.productVariant.create({
        data: {
          productId: dto.productId,
          sku: dto.sku,
          name: dto.name,
          size: dto.size ?? null,
          color: dto.color ?? null,
          price: dto.price,
          stock: dto.stock ?? 0,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Product variant with sku "${dto.sku}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductVariantDto) {
    await this.findOne(id);

    try {
      return await this.prisma.productVariant.update({
        where: { id },
        data: {
          ...(dto.sku !== undefined && { sku: dto.sku }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.size !== undefined && { size: dto.size }),
          ...(dto.color !== undefined && { color: dto.color }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.stock !== undefined && { stock: dto.stock }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Product variant with sku "${dto.sku}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.productVariant.delete({ where: { id } });
    return { message: 'Product variant deleted' };
  }

  async updateStock(id: string, quantity: number) {
    const variant = await this.findOne(id);
    const newStock = variant.stock + quantity;
    if (newStock < 0) {
      throw new ConflictException('Insufficient stock');
    }
    return this.prisma.productVariant.update({
      where: { id },
      data: { stock: newStock },
    });
  }
}
