import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { OmniTokenService } from '../tokens/omni-token.service';
import { PrismaService } from '../../database/prisma.service';

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
    const authHeader: string = request.headers['authorization'] || '';

    // Check if Personal Access Token (omni_pat_...) is used
    if (authHeader.startsWith('Bearer omni_pat_')) {
      const plainToken = authHeader.substring(7).trim();
      const { userId, abilities, tokenId } = await this.tokenService.authenticateToken(plainToken);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or token has expired');
      }

      request.user = user;
      request.tokenAbilities = abilities;
      request.tokenId = tokenId;
      return true;
    }

    // Default: Validate JWT bearer token via Passport Strategy
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication token required or invalid');
    }
    return user;
  }
}

