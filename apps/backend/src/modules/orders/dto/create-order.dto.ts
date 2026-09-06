import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Rahim Ahmed' })
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'rahim@example.com' })
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({ example: '+8801812345678', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: 'House 12, Road 4, Banani, Dhaka' })
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
