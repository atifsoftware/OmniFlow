import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationQueryDto } from '../../core/common/pagination.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllProducts(query: PaginationQueryDto) {
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
  }

  async findProductBySlug(slug: string) {
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
  }

  async createProduct(dto: CreateProductDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return this.prisma.product.create({
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
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
    });
  }
}
