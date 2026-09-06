import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../../core/common/enums';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationQueryDto } from '../../core/common/pagination.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Roles } from '../../core/decorators/roles.decorator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED })
  @IsNotEmpty()
  @IsEnum(OrderStatus, {
    message: `status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsNotEmpty()
  @IsEnum(PaymentStatus, {
    message: `paymentStatus must be one of: ${Object.values(PaymentStatus).join(', ')}`,
  })
  paymentStatus: PaymentStatus;
}

export class CancelOrderDto {
  @ApiProperty({ required: false, example: 'Customer requested cancellation before shipment' })
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('Orders & Checkout')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new order (Authenticated Customer/Cashier checkout)' })
  createOrder(@Body() dto: CreateOrderDto, @CurrentUser('id') userId?: string) {
    return this.ordersService.createOrder(dto, userId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders with pagination (Admin)' })
  getOrders(@Query() query: PaginationQueryDto) {
    return this.ordersService.findAllOrders(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by ID (Admin or order owner)' })
  getOrder(@Param('id') id: string, @CurrentUser() user?: { id: string; role: string }) {
    return this.ordersService.findOrderById(id, user);
  }

  @Put(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order lifecycle status (Admin/Manager)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }

  @Put(':id/payment')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order payment status (Admin/Cashier)' })
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.ordersService.updatePaymentStatus(id, dto.paymentStatus);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order and automatically restore stock (Admin/Customer)' })
  cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.ordersService.cancelOrder(id, dto.reason, userId);
  }
}
