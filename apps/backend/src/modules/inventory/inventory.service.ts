import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listStockOverview() {
    return this.prisma.inventory.findMany({
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
        product: { select: { id: true, name: true, sku: true, price: true } },
      },
    });
  }

  async listWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { _count: { select: { inventories: true } } },
    });
  }

  async adjustStock(dto: AdjustStockDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current stock
      const current = await tx.inventory.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
      });

      const previousQty = current ? current.quantityOnHand : 0;
      const newQty = previousQty + dto.adjustmentQuantity;

      if (newQty < 0) {
        throw new BadRequestException(`Insufficient stock. Available: ${previousQty}, Requested deduction: ${Math.abs(dto.adjustmentQuantity)}`);
      }

      // 2. Update or Create Inventory
      const inventory = await tx.inventory.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
        update: { quantityOnHand: newQty },
        create: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantityOnHand: newQty,
        },
      });

      // 3. Log Stock Movement audit ledger
      const movement = await tx.stockMovement.create({
        data: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          type: dto.movementType,
          quantity: dto.adjustmentQuantity,
          balanceAfter: newQty,
          notes: dto.notes,
          userId,
        },
      });

      return {
        success: true,
        inventory,
        movement,
      };
    });
  }
}
