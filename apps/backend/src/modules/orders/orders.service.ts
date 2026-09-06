import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

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

      // 2. Calculate totals
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
      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Create Order
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

      return order;
    });
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
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
