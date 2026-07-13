import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { GeminiService } from '../ai/gemini.service.js';
import type { PaginatedResponse } from '../common/dto/pagination.dto.js';
import {
  CreateProductDto,
  ProductFilterDto,
  SearchProductsDto,
  UpdateProductDto,
} from './dto/product.dto.js';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
  ) {}

  async findAll(filters: ProductFilterDto): Promise<PaginatedResponse<object>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      categoryId,
      minPrice,
      maxPrice,
      size,
      color,
      search,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            variants: {
              some: {
                price: {
                  ...(minPrice !== undefined && { gte: minPrice }),
                  ...(maxPrice !== undefined && { lte: maxPrice }),
                },
              },
            },
          }
        : {}),
      ...(size || color
        ? {
            variants: {
              some: {
                ...(size && { size: { equals: size, mode: 'insensitive' } }),
                ...(color && {
                  color: { equals: color, mode: 'insensitive' },
                }),
              },
            },
          }
        : {}),
    };

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
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
          _count: { select: { variants: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async searchProducts(dto: SearchProductsDto): Promise<PaginatedResponse<object>> {
    const { q, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
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
          _count: { select: { variants: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    });
    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    await this.prisma.category
      .findFirstOrThrow({
        where: { id: dto.categoryId, deletedAt: null },
      })
      .catch(() => {
        throw new NotFoundException(
          `Category with id "${dto.categoryId}" not found`,
        );
      });

    try {
      return await this.prisma.product.create({
        data: dto,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Product with slug "${dto.slug}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      await this.prisma.category
        .findFirstOrThrow({
          where: { id: dto.categoryId, deletedAt: null },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with id "${dto.categoryId}" not found`,
          );
        });
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Product with slug "${dto.slug}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Product deleted' };
  }

  async restore(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    if (!product.deletedAt) {
      return product;
    }
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async generateDescription(id: string): Promise<{ description: string }> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { name: true } },
        variants: {
          select: { size: true, color: true, price: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    const sizes = [
      ...new Set(product.variants.map((v) => v.size).filter(Boolean)),
    ];
    const colors = [
      ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
    ];
    const prices = product.variants.map((v) => Number(v.price));
    const priceRange =
      prices.length > 0
        ? `$${Math.min(...prices)}–$${Math.max(...prices)}`
        : 'N/A';

    const prompt = [
      'You are a professional e-commerce copywriter.',
      '',
      'Write a product description for the following item.',
      'The description should be:',
      '- Professional and persuasive',
      '- SEO-friendly (naturally include the product name and key attributes)',
      '- 2–4 short paragraphs (roughly 100–200 words)',
      '- Highlight key features, materials, and use cases where relevant',
      '- End with a compelling call to action',
      '',
      'Do NOT include a title or heading — just the description body.',
      'Do NOT use markdown formatting or bullet points — plain text only.',
      '',
      `Product name: "${product.name}"`,
      `Category: "${product.category.name}"`,
      product.description
        ? `Current description (rewrite and improve): "${product.description}"`
        : '',
      sizes.length > 0 ? `Available sizes: ${sizes.join(', ')}` : '',
      colors.length > 0 ? `Available colors: ${colors.join(', ')}` : '',
      `Price range: ${priceRange}`,
    ]
      .filter(Boolean)
      .join('\n');

    const text = await this.gemini.generateContent(prompt);

    if (!text) {
      throw new ServiceUnavailableException(
        'AI description generation is unavailable. Ensure GEMINI_API_KEY is configured and the service is reachable.',
      );
    }

    return { description: text.trim() };
  }

  async getRecommendations(id: string): Promise<{
    source: 'ai' | 'fallback';
    products: object[];
  }> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    // Try the AI path first
    const aiResult = await this.getAiRecommendations(
      product.name,
      product.category.name,
      product.description,
      product.id,
    );

    if (aiResult !== null) {
      return { source: 'ai', products: aiResult };
    }

    // Fallback: same category, different product
    this.logger.log(
      `Falling back to category recommendations for product "${id}"`,
    );
    return {
      source: 'fallback',
      products: await this.getFallbackRecommendations(product),
    };
  }

  private async getAiRecommendations(
    productName: string,
    categoryName: string,
    description: string | null,
    excludeId: string,
  ): Promise<object[] | null> {
    const prompt = [
      'You are a product recommendation engine for an e-commerce store.',
      'A shopper is browsing the following product:',
      '',
      `Product name: "${productName}"`,
      `Category: "${categoryName}"`,
      description ? `Description: "${description}"` : '',
      '',
      'Suggest exactly 3 types of COMPLEMENTARY products this shopper would',
      'also want to buy alongside the product above. Think about what a real',
      'shopper would add to their cart.',
      '',
      'Rules:',
      '- Do NOT suggest the same product or products in the same category.',
      '- Suggest complementary product types (e.g. for "Road Bike", suggest',
      '  "Helmet", "Cycling Shorts", "Water Bottle").',
      '- Return ONLY a JSON array, no markdown fences, no explanation.',
      '',
      'Format:',
      '[{"category": "<category name>", "keywords": ["<search term>"]}, ...]',
    ]
      .filter(Boolean)
      .join('\n');

    const text = await this.gemini.generateContent(prompt);
    if (!text) return null;

    const suggestions = this.parseSuggestions(text);
    if (suggestions.length === 0) return null;

    return this.findMatchingProducts(suggestions, excludeId);
  }

  private parseSuggestions(text: string): Array<{
    category: string;
    keywords: string[];
  }> {
    try {
      // Strip markdown code fences if present
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: unknown = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(
          (item): item is { category: string; keywords: string[] } =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as Record<string, unknown>).category === 'string' &&
            Array.isArray((item as Record<string, unknown>).keywords),
        )
        .slice(0, 3);
    } catch {
      this.logger.warn(
        `Failed to parse Gemini suggestions: ${text.slice(0, 200)}`,
      );
      return [];
    }
  }

  private async findMatchingProducts(
    suggestions: Array<{ category: string; keywords: string[] }>,
    excludeId: string,
  ): Promise<object[]> {
    // Build an OR query: match by category name OR keyword in name/description
    const conditions: Prisma.ProductWhereInput[] = [];

    for (const suggestion of suggestions) {
      const categoryMatch: Prisma.ProductWhereInput = {
        category: {
          name: { contains: suggestion.category, mode: 'insensitive' },
        },
      };

      const keywordMatches: Prisma.ProductWhereInput[] =
        suggestion.keywords.map((kw) => ({
          OR: [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
          ],
        }));

      conditions.push({
        OR: [categoryMatch, ...keywordMatches],
      });
    }

    const products = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        id: { not: excludeId },
        OR: conditions,
      },
      take: 3,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
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
    });

    // If Gemini suggestions didn't find enough, pad with fallback
    if (products.length < 3) {
      const existingIds = new Set([excludeId, ...products.map((p) => p.id)]);
      const padCount = 3 - products.length;

      const padding = await this.prisma.product.findMany({
        where: {
          deletedAt: null,
          id: { notIn: [...existingIds] },
        },
        take: padCount,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
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
      });

      products.push(...padding);
    }

    return products;
  }

  private async getFallbackRecommendations(product: {
    id: string;
    categoryId: string;
  }): Promise<object[]> {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
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
    });
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: string,
  ): Prisma.ProductOrderByWithRelationInput {
    const allowed = [
      'name',
      'slug',
      'createdAt',
      'updatedAt',
      'category',
    ] as const;

    const field = allowed.includes(sortBy as (typeof allowed)[number])
      ? sortBy
      : 'createdAt';

    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    if (field === 'category') {
      return { category: { name: order } };
    }

    return { [field]: order };
  }
}
