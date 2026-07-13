import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { Role } from '../../generated/prisma/enums.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import type { PaginatedResponse } from '../common/dto/pagination.dto.js';
import { UserFilterDto } from './dto/user.dto.js';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { orders: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    filters: UserFilterDto,
  ): Promise<PaginatedResponse<object>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      role,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const allowedSort = ['createdAt', 'email', 'firstName', 'lastName'] as const;
    const field = allowedSort.includes(sortBy as (typeof allowedSort)[number])
      ? sortBy
      : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: sortOrder },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SELECT,
    });
  }

  async getStats() {
    const [totalUsers, totalCustomers, totalAdmins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);
    return { totalUsers, totalCustomers, totalAdmins };
  }
}
