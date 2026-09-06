import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ example: 'WH-MAIN' })
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10, description: 'Positive number to add, negative to deduct' })
  @IsInt()
  adjustmentQuantity: number;

  @ApiProperty({ example: 'ADJUSTMENT_ADD', enum: ['INWARD_PURCHASE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'SCRAP_DAMAGE'] })
  @IsNotEmpty()
  movementType: string;

  @ApiProperty({ example: 'Manual cycle count correction', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
