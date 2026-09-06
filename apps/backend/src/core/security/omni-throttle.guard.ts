import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY, IThrottleOptions } from './throttle.decorator';

interface RequestRecord {
  count: number;
  expiresAt: number;
}

/**
 * OmniFlow Security Throttle Guard
 * Features:
 * - Query-parameter-independent keying (prevents query param cache-busting bypass)
 * - Automatic background eviction of expired memory keys (prevents memory leak)
 * - Configurable limits via @Throttle({ limit, ttlSeconds })
 */
@Injectable()
export class OmniThrottleGuard implements CanActivate {
  private readonly logger = new Logger(OmniThrottleGuard.name);
  private storage = new Map<string, RequestRecord>();
  private lastCleanupTime = Date.now();
  private readonly cleanupIntervalMs = 60 * 1000; // prune every 60s

  constructor(private reflector: Reflector) {}

  private pruneExpired(): void {
    const now = Date.now();
    if (now - this.lastCleanupTime < this.cleanupIntervalMs && this.storage.size < 1000) {
      return;
    }
    this.lastCleanupTime = now;

    let deletedCount = 0;
    for (const [key, record] of this.storage.entries()) {
      if (now > record.expiresAt) {
        this.storage.delete(key);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      this.logger.debug(`Pruned ${deletedCount} expired throttle records. Active: ${this.storage.size}`);
    }
  }

  canActivate(context: ExecutionContext): boolean {
    // 1. Memory housekeeping
    this.pruneExpired();

    const options = this.reflector.getAllAndOverride<IThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Default rate limit: 60 requests per minute if not explicitly decorated
    const limit = options?.limit || 60;
    const ttlSeconds = options?.ttlSeconds || 60;

    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';

    // Strip query parameters to prevent cache-busting bypass (e.g. ?cb=123)
    const rawPath = req.path || req.baseUrl || (req.url ? req.url.split('?')[0] : '/');
    const sanitizedPath = (rawPath || '/').toLowerCase();
    const method = (req.method || 'GET').toUpperCase();

    const key = `${ip}:${method}:${sanitizedPath}`;
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
          message: `Rate limit exceeded for this endpoint. Please try again in ${waitTime} seconds.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    return true;
  }
}
