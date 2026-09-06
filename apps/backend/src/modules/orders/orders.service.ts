import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { OrderStatus, PaymentStatus } from '../../core/common/enums';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationQueryDto } from '../../core/common/pagination.dto';

@Injectable()
export class OrdersService {
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

      // 2. Identify default warehouse or active warehouse for inventory deduction
      const warehouse =
        (await tx.warehouse.findFirst({ where: { isActive: true, isDefault: true } })) ||
        (await tx.warehouse.findFirst({ where: { isActive: true } }));

      // Batch-fetch all warehouse inventory in a single query
      const inventoryMap = new Map<string, { quantityOnHand: number }>();
      if (warehouse) {
        const inventories = await tx.inventory.findMany({
          where: {
            warehouseId: warehouse.id,
            productId: { in: productIds },
          },
          select: {
            productId: true,
            quantityOnHand: true,
          },
        });
        for (const inv of inventories) {
          inventoryMap.set(inv.productId, { quantityOnHand: inv.quantityOnHand });
        }
      }

      // Aggregate total requested quantity per product to prevent multi-line stock bypass
      const totalRequestedPerProduct = new Map<string, number>();
      for (const item of dto.items) {
        totalRequestedPerProduct.set(
          item.productId,
          (totalRequestedPerProduct.get(item.productId) || 0) + item.quantity,
        );
      }

      // 3. Check inventory availability and calculate totals
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const unitPriceNum = Number(product.price);
        const lineTotal = Number((unitPriceNum * item.quantity).toFixed(2));
        subtotal += lineTotal;

        if (warehouse) {
          const availableQty = inventoryMap.get(product.id)?.quantityOnHand ?? 0;
          const totalRequested = totalRequestedPerProduct.get(product.id) || item.quantity;
          if (availableQty < totalRequested) {
            throw new BadRequestException(
              `Insufficient stock for "${product.name}" in warehouse [${warehouse.name}]. Available: ${availableQty}, requested: ${totalRequested}`,
            );
          }
        }

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal: lineTotal,
        });
      }

      const taxAmount = Number((subtotal * 0.05).toFixed(2)); // 5% VAT
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      // Cryptographically secure collision-free order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
      const orderNumber = `ORD-${datePart}-${randPart}`;

      // 4. Create Order record
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

      // 5. Deduct inventory and record stock movements (reusing in-memory state without N+1 queries)
      if (warehouse) {
        for (const item of dto.items) {
          const invRecord = inventoryMap.get(item.productId);
          const prevQty = invRecord ? invRecord.quantityOnHand : 0;
          const newQty = prevQty - item.quantity;

          // Update in-memory state for subsequent items of same product
          if (invRecord) {
            invRecord.quantityOnHand = newQty;
          }

          await tx.inventory.upsert({
            where: {
              warehouseId_productId: {
                warehouseId: warehouse.id,
                productId: item.productId,
              },
            },
            update: { quantityOnHand: newQty },
            create: {
              warehouseId: warehouse.id,
              productId: item.productId,
              quantityOnHand: newQty,
            },
          });

          await tx.stockMovement.create({
            data: {
              warehouseId: warehouse.id,
              productId: item.productId,
              type: 'OUTWARD_SALE',
              quantity: -item.quantity,
              balanceAfter: newQty,
              referenceType: 'ORDER',
              referenceId: order.id,
              notes: `Order #${orderNumber} placed by ${dto.customerName}`,
              userId,
            },
          });
        }
      }

      return order;
    });
  }

  async findAllOrders(query: PaginationQueryDto = new PaginationQueryDto()) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { customerName: { contains: query.search } },
        { customerEmail: { contains: query.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findOrderById(id: string, user?: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Customer can only view their own orders; Staff/Admin can view all
    if (user && user.role === 'CUSTOMER' && order.userId && order.userId !== user.id) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus | string) {
    const validStatuses = Object.values(OrderStatus);
    const upperStatus = status.toUpperCase() as OrderStatus;
    if (!validStatuses.includes(upperStatus)) {
      throw new BadRequestException(
        `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
      );
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot modify status of an already cancelled order');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: upperStatus },
      include: { items: true },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus | string) {
    const validStatuses = Object.values(PaymentStatus);
    const upperStatus = paymentStatus.toUpperCase() as PaymentStatus;
    if (!validStatuses.includes(upperStatus)) {
      throw new BadRequestException(
        `Invalid payment status "${paymentStatus}". Allowed values: ${validStatuses.join(', ')}`,
      );
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus: upperStatus },
    });
  }

  async cancelOrder(id: string, reason?: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }
    if (order.status === 'DELIVERED') {
      throw new BadRequestException('Delivered orders cannot be cancelled directly. Initiate a return instead.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: reason ? `${order.notes ? order.notes + ' | ' : ''}Cancellation reason: ${reason}` : order.notes,
        },
      });

      // 2. Identify default warehouse to restock
      const warehouse =
        (await tx.warehouse.findFirst({ where: { isActive: true, isDefault: true } })) ||
        (await tx.warehouse.findFirst({ where: { isActive: true } }));

      // 3. Restore inventory if warehouse exists
      if (warehouse) {
        for (const item of order.items) {
          const inv = await tx.inventory.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId: warehouse.id,
                productId: item.productId,
              },
            },
          });
          const prevQty = inv ? inv.quantityOnHand : 0;
          const newQty = prevQty + item.quantity;

          await tx.inventory.upsert({
            where: {
              warehouseId_productId: {
                warehouseId: warehouse.id,
                productId: item.productId,
              },
            },
            update: { quantityOnHand: newQty },
            create: {
              warehouseId: warehouse.id,
              productId: item.productId,
              quantityOnHand: newQty,
            },
          });

          await tx.stockMovement.create({
            data: {
              warehouseId: warehouse.id,
              productId: item.productId,
              type: 'INWARD_RETURN',
              quantity: item.quantity,
              balanceAfter: newQty,
              referenceType: 'ORDER_CANCEL',
              referenceId: order.id,
              notes: `Stock restored from cancelled order #${order.orderNumber}`,
              userId,
            },
          });
        }
      }

      return updatedOrder;
    });
  }
}

