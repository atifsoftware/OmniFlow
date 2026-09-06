import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getOrders(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.ordersService.findAllOrders({ page, limit });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrder(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }
}
