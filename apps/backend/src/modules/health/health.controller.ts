import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('System & Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'OmniFlow framework status & system health overview' })
  async checkHealth() {
    let dbStatus = 'ONLINE';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'OFFLINE';
    }

    return {
      framework: 'OmniFlow Enterprise ERP',
      version: '1.0.0',
      status: 'HEALTHY',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        cache: 'MEMORY_STORE_READY',
      },
      registeredModules: [
        'Auth & RBAC',
        'Catalog & Products',
        'Multi-Warehouse Inventory',
        'Orders & Checkout',
        'RequestContext (AsyncLocalStorage)',
        'OmniResponseInterceptor (ApiResource)',
      ],
    };
  }
}
