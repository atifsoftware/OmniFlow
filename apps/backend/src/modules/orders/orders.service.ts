import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, userId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch product prices and verify existence
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more selected products are invalid or inactive');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 2. Select default or first active warehouse for inventory deduction
      let warehouse = await tx.warehouse.findFirst({
        where: { isDefault: true, isActive: true },
      });
      if (!warehouse) {
        warehouse = await tx.warehouse.findFirst({
          where: { isActive: true },
        });
      }
      if (!warehouse) {
        // Auto-provision a default warehouse if none exists
        warehouse = await tx.warehouse.create({
          data: {
            name: 'Main Distribution Center',
            code: 'WH-MAIN',
            isDefault: true,
            isActive: true,
          },
        });
      }

      // 3. Verify stock sufficiency for every item before deduction
      for (const item of dto.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: warehouse.id,
              productId: item.productId,
            },
          },
        });

        const available = inv ? inv.quantityOnHand : 0;
        if (available < item.quantity) {
          const prod = productMap.get(item.productId);
          throw new BadRequestException(
            `Insufficient stock for "${prod?.name || item.productId}". Available: ${available}, Requested: ${item.quantity}`,
          );
        }
      }

      // 4. Calculate subtotal & tax
      let subtotal = 0;
      const orderItemsData = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPriceNum = Number(product.price);
        const lineTotal = Number((unitPriceNum * item.quantity).toFixed(2));
        subtotal += lineTotal;
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal: lineTotal,
        };
      });

      const taxAmount = Number((subtotal * 0.05).toFixed(2)); // 5% VAT
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      // Crypto-secure order number generation (no Math.random collisions)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          shippingAddress: dto.shippingAddress,
          subtotal,
          taxAmount,
          totalAmount,
          notes: dto.notes,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // 6. Deduct stock & create audit StockMovements atomically
      for (const item of dto.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: warehouse.id,
              productId: item.productId,
            },
          },
        });

        const newBalance = (inv?.quantityOnHand || 0) - item.quantity;

        await tx.inventory.update({
          where: { id: inv!.id },
          data: { quantityOnHand: newBalance },
        });

        await tx.stockMovement.create({
          data: {
            warehouseId: warehouse.id,
            productId: item.productId,
            type: 'OUTWARD_SALE',
            quantity: -item.quantity,
            balanceAfter: newBalance,
            referenceType: 'ORDER',
            referenceId: order.id,
            notes: `Order ${orderNumber} fulfillment`,
            userId: userId || null,
          },
        });
      }

      this.logger.log(`📦 Order created successfully: ${orderNumber} (Total: ৳ ${totalAmount})`);
      return order;
    });
  }

  async findAllOrders(query?: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.order.count(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + items.length < total,
      },
    };
  }

  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
