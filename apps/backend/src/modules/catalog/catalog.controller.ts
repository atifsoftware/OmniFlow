import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationQueryDto } from '../../core/common/pagination.dto';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Catalog & Products')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'List all active products with pagination and filters' })
  getProducts(@Query() query: PaginationQueryDto) {
    return this.catalogService.findAllProducts(query);
  }

  @Public()
  @Get('products/:slug')
  @ApiOperation({ summary: 'Get product details by slug' })
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.findProductBySlug(slug);
  }

  @Post('products')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product (Admin/Manager only)' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  getCategories() {
    return this.catalogService.findAllCategories();
  }
}
