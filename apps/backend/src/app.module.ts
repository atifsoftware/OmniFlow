import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { OmniCoreModule } from './core/core.module';
import { PrismaModule } from './database/prisma.module';
import { OmniContextMiddleware } from './core/context/omni-context.middleware';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { OmniThrottleGuard } from './core/security/omni-throttle.guard';

import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OmniCoreModule,
    AuthModule,
    CatalogModule,
    InventoryModule,
    OrdersModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: OmniThrottleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OmniContextMiddleware).forRoutes('*');
  }
}
