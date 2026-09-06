import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('Orders & Checkout')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create new order (Customer checkout)' })
  createOrder(@Body() dto: CreateOrderDto, @CurrentUser('id') userId?: string) {
    return this.ordersService.createOrder(dto, userId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (Admin)' })
  getOrders() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrder(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }
}
