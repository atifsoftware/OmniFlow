import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';

@ApiTags('ERP Inventory & Warehouses')
@Controller('inventory')
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('overview')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')
  @ApiOperation({ summary: 'View all warehouse stock levels' })
  getStockOverview() {
    return this.inventoryService.listStockOverview();
  }

  @Get('warehouses')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')
  @ApiOperation({ summary: 'List all operational warehouses' })
  getWarehouses() {
    return this.inventoryService.listWarehouses();
  }

  @Post('adjust')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')
  @ApiOperation({ summary: 'Adjust stock levels with audit logging' })
  adjustStock(@Body() dto: AdjustStockDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.adjustStock(dto, userId);
  }
}
