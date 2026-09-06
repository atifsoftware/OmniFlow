import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY, IThrottleOptions } from './throttle.decorator';
import { OmniCacheService } from '../cache/omni-cache.service';

interface RequestRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class OmniThrottleGuard implements CanActivate, OnModuleDestroy {
  private storage = new Map<string, RequestRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private reflector: Reflector,
    @Optional() private cache?: OmniCacheService,
  ) {
    // Run garbage collection every 60 seconds to prevent unbounded memory growth
    this.cleanupInterval = setInterval(() => {
      this.evictExpired();
    }, 60000);
    // Don't keep the event loop alive just for cleanup
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      if (now > record.expiresAt) {
        this.storage.delete(key);
      }
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<IThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Default rate limit: 60 requests per minute if not explicitly decorated
    const limit = options?.limit || 60;
    const ttlSeconds = options?.ttlSeconds || 60;

    const req = context.switchToHttp().getRequest();
    // Express trust proxy securely derives req.ip; avoid spoofable raw header check
    const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
    
    // Strip query strings to prevent rate limit bypass
    const routePath = req.baseUrl || req.path || (req.url ? req.url.split('?')[0] : '/');
    const key = `throttle:${ip}:${req.method}:${routePath}`;

    // 1. Try distributed rate limiting via OmniCacheService if available
    if (this.cache) {
      try {
        const currentCount = (await this.cache.getAsync<number>(key)) || 0;
        if (currentCount >= limit) {
          throw new HttpException(
            {
              success: false,
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              error: 'Too Many Requests',
              message: `Rate limit exceeded. Please try again later.`,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        await this.cache.set(key, currentCount + 1, ttlSeconds);
        return true;
      } catch (err) {
        if (err instanceof HttpException) throw err;
        // If Redis error occurs, gracefully fallback to in-memory check below
      }
    }

    // 2. In-memory fallback
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || now > record.expiresAt) {
      this.storage.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
      return true;
    }

    if (record.count >= limit) {
      const waitTime = Math.ceil((record.expiresAt - now) / 1000);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${waitTime} seconds.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    return true;
  }
}

