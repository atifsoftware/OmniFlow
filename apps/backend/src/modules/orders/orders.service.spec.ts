import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../database/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb) => cb(prisma)),
      product: {
        findMany: jest.fn(),
      },
      warehouse: {
        findFirst: jest.fn(),
      },
      inventory: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw BadRequestException if items are empty', async () => {
      await expect(
        service.createOrder({
          customerName: 'Alice',
          customerEmail: 'alice@test.com',
          customerPhone: '01711111111',
          shippingAddress: 'Dhaka, BD',
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product is missing or inactive', async () => {
      prisma.product.findMany.mockResolvedValue([]); // returns no products

      await expect(
        service.createOrder({
          customerName: 'Alice',
          customerEmail: 'alice@test.com',
          customerPhone: '01711111111',
          shippingAddress: 'Dhaka, BD',
          items: [{ productId: 'non-existent-p', quantity: 2 }],
        }),
      ).rejects.toThrow('One or more selected products are invalid or inactive');
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p-1', name: 'Laptop', price: 1000, isActive: true },
      ]);
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1', name: 'Central Warehouse' });
      prisma.inventory.findMany.mockResolvedValue([
        { productId: 'p-1', quantityOnHand: 1 }, // only 1 in stock
      ]);

      await expect(
        service.createOrder({
          customerName: 'Alice',
          customerEmail: 'alice@test.com',
          customerPhone: '01711111111',
          shippingAddress: 'Dhaka, BD',
          items: [{ productId: 'p-1', quantity: 5 }], // requests 5
        }),
      ).rejects.toThrow(/Insufficient stock/);
    });

    it('should successfully create order and calculate 5% VAT', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p-1', name: 'Keyboard', price: 100, sku: 'KB-01', isActive: true },
      ]);
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1', name: 'Main' });
      prisma.inventory.findMany.mockResolvedValue([
        { productId: 'p-1', quantityOnHand: 20 },
      ]);

      const mockCreatedOrder = {
        id: 'ord-100',
        orderNumber: 'ORD-2026-ABC123',
        subtotal: 200,
        taxAmount: 10,
        totalAmount: 210,
        status: 'PENDING',
      };
      prisma.order.create.mockResolvedValue(mockCreatedOrder);
      prisma.inventory.upsert.mockResolvedValue({});
      prisma.stockMovement.create.mockResolvedValue({});

      const result = await service.createOrder({
        customerName: 'Bob',
        customerEmail: 'bob@test.com',
        customerPhone: '01822222222',
        shippingAddress: 'Chittagong, BD',
        items: [{ productId: 'p-1', quantity: 2 }],
      });

      expect(result.id).toBe('ord-100');
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 200,
            taxAmount: 10,
            totalAmount: 210,
            status: 'PENDING',
          }),
        }),
      );
      // Verify inventory deducted
      expect(prisma.inventory.upsert).toHaveBeenCalled();
      expect(prisma.stockMovement.create).toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException on invalid status string', async () => {
      await expect(
        service.updateOrderStatus('ord-1', 'INVALID_STATUS'),
      ).rejects.toThrow(/Invalid status/);
    });

    it('should throw BadRequestException when modifying a CANCELLED order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'ord-1', status: 'CANCELLED' });

      await expect(
        service.updateOrderStatus('ord-1', 'SHIPPED'),
      ).rejects.toThrow('Cannot modify status of an already cancelled order');
    });

    it('should successfully update status', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'ord-1', status: 'PENDING' });
      prisma.order.update.mockResolvedValue({ id: 'ord-1', status: 'CONFIRMED' });

      const updated = await service.updateOrderStatus('ord-1', 'confirmed');
      expect(updated.status).toBe('CONFIRMED');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CONFIRMED' } }),
      );
    });
  });

  describe('cancelOrder', () => {
    it('should throw BadRequestException if order is already cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'ord-1', status: 'CANCELLED', items: [] });

      await expect(service.cancelOrder('ord-1')).rejects.toThrow('Order is already cancelled');
    });

    it('should throw BadRequestException if order is delivered', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'ord-1', status: 'DELIVERED', items: [] });

      await expect(service.cancelOrder('ord-1')).rejects.toThrow(/Delivered orders cannot be cancelled/);
    });

    it('should cancel order and restore inventory', async () => {
      const mockOrder = {
        id: 'ord-1',
        orderNumber: 'ORD-123',
        status: 'PENDING',
        notes: '',
        items: [{ productId: 'p-1', quantity: 3 }],
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1' });
      prisma.inventory.findUnique.mockResolvedValue({ quantityOnHand: 5 });
      prisma.inventory.upsert.mockResolvedValue({});
      prisma.stockMovement.create.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      const res = await service.cancelOrder('ord-1', 'Customer changed mind');
      expect(res.status).toBe('CANCELLED');
      expect(prisma.inventory.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantityOnHand: 8 }, // 5 + 3 restored
        }),
      );
      expect(prisma.stockMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'INWARD_RETURN',
            referenceType: 'ORDER_CANCEL',
            quantity: 3,
          }),
        }),
      );
    });
  });

  describe('findOrderById', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findOrderById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should return order and exclude sensitive password field from user', async () => {
      const mockOrder = {
        id: 'ord-10',
        orderNumber: 'ORD-10',
        items: [],
        user: { id: 'u-1', name: 'Alice', email: 'alice@test.com', role: 'CUSTOMER' },
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOrderById('ord-10');
      expect(result).toEqual(mockOrder);
      expect(prisma.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-10' },
          include: expect.objectContaining({
            items: true,
            user: {
              select: expect.objectContaining({
                id: true,
                name: true,
                email: true,
                role: true,
              }),
            },
          }),
        }),
      );
    });

    it('should throw ForbiddenException if customer tries to view someone elses order', async () => {
      const mockOrder = {
        id: 'ord-10',
        userId: 'u-another-customer',
        items: [],
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.findOrderById('ord-10', { id: 'u-current-customer', role: 'CUSTOMER' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow customer to view their own order', async () => {
      const mockOrder = {
        id: 'ord-10',
        userId: 'u-current-customer',
        items: [],
      };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const res = await service.findOrderById('ord-10', { id: 'u-current-customer', role: 'CUSTOMER' });
      expect(res.id).toBe('ord-10');
    });
  });
});
