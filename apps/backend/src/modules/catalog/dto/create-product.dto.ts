import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Noise-Cancelling Headphones' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'PROD-HEADPHONE-01' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({ example: 149.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 85.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
