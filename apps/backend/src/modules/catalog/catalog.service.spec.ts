import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../../database/prisma.service';
import { OmniCacheService } from '../../core/cache/omni-cache.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: { product: { findUnique: jest.Mock; findMany: jest.Mock; count: jest.Mock; create: jest.Mock; update: jest.Mock }; category: { findMany: jest.Mock } };
  let cache: { remember: jest.Mock; del: jest.Mock; deleteByPattern: jest.Mock; get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
    };

    cache = {
      remember: jest.fn().mockImplementation((key, ttl, fetcher) => fetcher()),
      del: jest.fn().mockResolvedValue(true),
      deleteByPattern: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prisma },
        { provide: OmniCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should throw ConflictException if SKU already exists', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'existing', sku: 'SKU-100' });

      await expect(
        service.createProduct({
          name: 'Wireless Mouse',
          sku: 'SKU-100',
          price: 25.0,
          categoryId: 'cat-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create product with generated slug and invalidate categories cache', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue({
        id: 'prod-1',
        name: 'Wireless Mouse',
        slug: 'wireless-mouse',
        sku: 'SKU-NEW',
        price: 29.99,
      });

      const result = await service.createProduct({
        name: 'Wireless Mouse',
        sku: 'SKU-NEW',
        price: 29.99,
        categoryId: 'cat-1',
      });

      expect(result.id).toBe('prod-1');
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'wireless-mouse' }),
        }),
      );
      expect(cache.del).toHaveBeenCalledWith('categories:all');
    });

    it('should retry with random suffix on slug collision (P2002)', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      // First attempt: simulate unique constraint collision (P2002)
      // Second attempt: succeeds
      prisma.product.create
        .mockRejectedValueOnce({ code: 'P2002', message: 'Unique constraint failed on slug' })
        .mockResolvedValueOnce({
          id: 'prod-2',
          name: 'Mechanical Keyboard',
          slug: 'mechanical-keyboard-abc123',
          sku: 'KB-01',
          price: 99.99,
        });

      const result = await service.createProduct({
        name: 'Mechanical Keyboard',
        sku: 'KB-01',
        price: 99.99,
        categoryId: 'cat-1',
      });

      expect(prisma.product.create).toHaveBeenCalledTimes(2);
      expect(result.id).toBe('prod-2');
    });

    it('should throw ConflictException if all slug retry attempts are exhausted', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed on slug' });

      await expect(
        service.createProduct({
          name: 'Mechanical Keyboard',
          sku: 'KB-02',
          price: 99.99,
          categoryId: 'cat-1',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.product.create).toHaveBeenCalledTimes(5);
    });
  });

  describe('findProductBySlug', () => {
    it('should return product via cache remember pattern', async () => {
      const mockProduct = { id: 'p-1', name: 'Item', slug: 'item' };
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findProductBySlug('item');
      expect(result).toEqual(mockProduct);
      expect(cache.remember).toHaveBeenCalledWith(
        'product:slug:item',
        300,
        expect.any(Function),
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findProductBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product and invalidate cache', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p-1', name: 'Item', slug: 'item' });
      prisma.product.update.mockResolvedValue({ id: 'p-1', isActive: false });

      const result = await service.deleteProduct('p-1');
      expect(result.success).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { isActive: false },
      });
      expect(cache.del).toHaveBeenCalledWith('product:slug:item');
      expect(cache.del).toHaveBeenCalledWith('categories:all');
    });
  });
});
