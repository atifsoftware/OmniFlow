import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from './api-response.interface';
import { OmniContextService } from '../context/omni-context.service';

/**
 * OmniResponseInterceptor
 * Automatically transforms all controller responses into a uniform,
 * enterprise API payload (modeled and upgraded from NodeFlow's ApiResource).
 */
@Injectable()
export class OmniResponseInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  constructor(private readonly contextService: OmniContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<T>> {
    const http = context.switchToHttp();
    const response = http.getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;
    const traceId = this.contextService.getTraceId();

    return next.handle().pipe(
      map((res) => {
        // If already formatted, pass through
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return {
            ...res,
            timestamp: res.timestamp || new Date().toISOString(),
            traceId: res.traceId || traceId,
          };
        }

        // Support paginated responses: { items, meta }
        if (res && typeof res === 'object' && 'items' in res && 'meta' in res) {
          return {
            success: true,
            statusCode,
            message: 'Operation completed successfully',
            data: res.items,
            meta: res.meta,
            timestamp: new Date().toISOString(),
            traceId,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Operation completed successfully',
          data: res !== undefined ? res : null,
          timestamp: new Date().toISOString(),
          traceId,
        };
      }),
    );
  }
}
