import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OmniContextService } from './omni-context.service';

@Injectable()
export class OmniContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: OmniContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    res.setHeader('x-trace-id', traceId);

    this.contextService.run({ traceId }, () => {
      next();
    });
  }
}
