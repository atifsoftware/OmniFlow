import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { OmniTokenService } from '../tokens/omni-token.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * OmniFlow Hybrid Auth Guard
 * Authenticates requests via:
 * 1. Personal Access Token (Bearer omni_pat_...)
 * 2. Standard JWT Bearer Token (Passport strategy)
 * 3. Bypasses routes marked with @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: OmniTokenService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    // 1. Check for Personal Access Token (PAT)
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer omni_pat_')) {
      const plainToken = authHeader.slice(7).trim();
      const tokenResult = await this.tokenService.authenticateToken(plainToken);

      const user = await this.prisma.user.findUnique({
        where: { id: tokenResult.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User associated with API token not found or inactive.');
      }

      request.user = user;
      request.tokenAbilities = tokenResult.abilities;
      return true;
    }

    // 2. Standard Passport JWT authentication
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication token required or invalid');
    }
    return user;
  }
}
