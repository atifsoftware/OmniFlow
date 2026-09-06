import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY, IThrottleOptions } from './throttle.decorator';

interface RequestRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class OmniThrottleGuard implements CanActivate {
  private storage = new Map<string, RequestRecord>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<IThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Default rate limit: 60 requests per minute if not explicitly decorated
    const limit = options?.limit || 60;
    const ttlSeconds = options?.ttlSeconds || 60;

    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.url}`;

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
