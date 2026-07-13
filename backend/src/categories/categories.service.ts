import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import type { PaginatedResponse } from '../common/dto/pagination.dto.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20): Promise<PaginatedResponse<object>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.category.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Category with slug "${dto.slug}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Category with slug "${dto.slug}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Category deleted' };
  }

  async restore(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    if (!category.deletedAt) {
      return category;
    }
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
