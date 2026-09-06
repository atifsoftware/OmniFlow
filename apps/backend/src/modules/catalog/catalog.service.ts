import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { OmniCacheService } from '../../core/cache/omni-cache.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../../core/common/pagination.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: OmniCacheService,
  ) {}

  async findAllProducts(query: PaginationQueryDto) {
    const cacheKey = `products:list:${query.page || 1}:${query.limit || 20}:${query.search || ''}:${query.sortBy || 'createdAt'}:${query.sortOrder || 'desc'}`;

    return this.cache.remember(cacheKey, 60, async () => {
      const where: any = { isActive: true };
      if (query.search) {
        where.OR = [
          { name: { contains: query.search } },
          { sku: { contains: query.search } },
        ];
      }

      const [items, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip: query.skip,
          take: query.limit,
          orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            inventories: {
              select: { quantityOnHand: true, warehouse: { select: { name: true } } },
            },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        items,
        meta: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
          hasMore: query.page * query.limit < total,
        },
      };
    });
  }

  async findProductBySlug(slug: string) {
    const cacheKey = `product:slug:${slug}`;
    return this.cache.remember(cacheKey, 300, async () => {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          inventories: { include: { warehouse: true } },
        },
      });
      if (!product) {
        throw new NotFoundException(`Product with slug "${slug}" not found`);
      }
      return product;
    });
  }

  async createProduct(dto: CreateProductDto) {
    let baseSlug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!baseSlug) {
      baseSlug = `product-${Date.now().toString(36)}`;
    }

    // Check SKU first
    const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existingSku) {
      throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
    }

    let slug = baseSlug;
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const created = await this.prisma.product.create({
          data: {
            name: dto.name,
            slug,
            sku: dto.sku,
            price: dto.price,
            costPrice: dto.costPrice || 0,
            categoryId: dto.categoryId,
            description: dto.description,
          },
        });
        await this.cache.del('categories:all');
        await this.cache.deleteByPattern('products:list:*');
        return created;
      } catch (error: any) {
        if (error.code === 'P2002') {
          if (attempt < maxRetries - 1) {
            // Collision occurred, generate a cryptographically random suffix and retry
            const suffix = crypto.randomBytes(3).toString('hex');
            slug = `${baseSlug}-${suffix}`;
            continue;
          }
          throw new ConflictException(
            `Failed to generate unique product slug for "${dto.name}" after ${maxRetries} attempts. Please choose a different name.`,
          );
        }
        throw error;
      }
    }

    throw new ConflictException(
      `Failed to generate a unique product slug for "${dto.name}" after ${maxRetries} attempts. Please try again with a different name.`,
    );
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const skuConflict = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
      if (skuConflict) {
        throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
      },
    });

    // Invalidate product caches
    await this.cache.del(`product:slug:${existing.slug}`);
    await this.cache.del('categories:all');
    await this.cache.deleteByPattern('products:list:*');

    return updated;
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Invalidate product caches
    await this.cache.del(`product:slug:${existing.slug}`);
    await this.cache.del('categories:all');
    await this.cache.deleteByPattern('products:list:*');

    return { success: true, message: `Product "${existing.name}" deactivated successfully` };
  }

  async findAllCategories() {
    return this.cache.remember('categories:all', 600, () =>
      this.prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: true } } },
      }),
    );
  }
}
