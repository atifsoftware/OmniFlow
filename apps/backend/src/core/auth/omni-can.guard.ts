import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GateService } from "./gate.service";
import { CAN_KEY } from "./can.decorator";

/**
 * OmniCanGuard — Route guard that checks Gate abilities
 * Works with @Can("edit-product") decorator
 *
 * Usage:
 *   @UseGuards(OmniCanGuard)
 *   @Can("edit-product")
 *   @Patch(":id")
 *   update() {}
 */
@Injectable()
export class OmniCanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private gate: GateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const abilities = this.reflector.getAllAndOverride<string[]>(CAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!abilities || abilities.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException("Authentication required.");

    for (const ability of abilities) {
      const allowed = await this.gate.allows(ability, user);
      if (!allowed) {
        throw new ForbiddenException("Permission denied: " + ability);
      }
    }

    return true;
  }
}
