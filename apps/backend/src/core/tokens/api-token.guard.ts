import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { OmniTokenService } from "./omni-token.service";
import { OmniDbService } from "../database/omni-db.service";

export const IS_PUBLIC_KEY = "isPublic";
export const REQUIRE_ABILITY_KEY = "requiredAbility";

/**
 * OmniFlow API Token Guard
 * Authenticates requests using Personal Access Tokens (omni_pat_...).
 * Attaches the resolved user to request.user.
 *
 * Usage:
 *   @UseGuards(ApiTokenGuard)
 *   @Controller("orders")
 *   export class OrdersController { ... }
 *
 * Mark public endpoints:
 *   @Public()
 *   @Get("health")
 *   health() {}
 */
@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: OmniTokenService,
    private readonly db: OmniDbService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers["authorization"] || "";

    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Bearer token required.");
    }

    const plainToken = authHeader.substring(7).trim();

    // Allow JWT tokens to pass through (handled by JwtAuthGuard)
    if (!plainToken.startsWith("omni_pat_")) return true;

    const { userId, abilities, tokenId } = await this.tokenService.authenticateToken(plainToken);

    // Check required ability if specified
    const requiredAbility = this.reflector.getAllAndOverride<string>(REQUIRE_ABILITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredAbility && !this.tokenService.can(abilities, requiredAbility)) {
      throw new UnauthorizedException(`Token lacks required ability: ${requiredAbility}`);
    }

    // Load user from DB
    const user = await this.db.table("users").where("id", userId).first<Record<string, unknown>>();
    if (!user) throw new UnauthorizedException("User not found.");

    request.user = user;
    request.tokenAbilities = abilities;
    request.tokenId = tokenId;

    return true;
  }
}
