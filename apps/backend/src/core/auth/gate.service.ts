import { Injectable } from "@nestjs/common";

type AbilityCallback = (user: Record<string, unknown>, ...args: unknown[]) => boolean | Promise<boolean>;

/**
 * OmniGate — Fine-grained Authorization Service
 * Inspired by NodeFlow-React Gate.js
 * Register abilities and check them anywhere in the app.
 *
 * Usage:
 *   gate.define("edit-product", (user, product) => user.role === "admin" || product.userId === user.id);
 *   const canEdit = await gate.allows("edit-product", user, product);
 *   gate.authorize("edit-product", user, product); // throws ForbiddenException if denied
 */
@Injectable()
export class GateService {
  private abilities = new Map<string, AbilityCallback>();

  /**
   * Register an authorization ability
   */
  define(ability: string, callback: AbilityCallback): void {
    this.abilities.set(ability, callback);
  }

  /**
   * Check if a user can perform an ability
   */
  async allows(ability: string, user: Record<string, unknown>, ...args: unknown[]): Promise<boolean> {
    const callback = this.abilities.get(ability);
    if (!callback) return false;
    if (!user) return false;
    return Boolean(await callback(user, ...args));
  }

  /**
   * Check if a user cannot perform an ability
   */
  async denies(ability: string, user: Record<string, unknown>, ...args: unknown[]): Promise<boolean> {
    return !(await this.allows(ability, user, ...args));
  }

  /**
   * Authorize — throws ForbiddenException if denied
   */
  async authorize(ability: string, user: Record<string, unknown>, ...args: unknown[]): Promise<void> {
    const allowed = await this.allows(ability, user, ...args);
    if (!allowed) {
      const { ForbiddenException } = await import("@nestjs/common");
      throw new ForbiddenException("You do not have permission to perform this action: " + ability);
    }
  }

  /**
   * Register multiple abilities at once from a policy object
   * Example: gate.policy("Product", ProductPolicy)
   */
  policy(resource: string, policyClass: Record<string, AbilityCallback>): void {
    for (const [method, callback] of Object.entries(policyClass)) {
      this.define(resource.toLowerCase() + "." + method, callback);
    }
  }

  /**
   * List all registered abilities
   */
  listAbilities(): string[] {
    return Array.from(this.abilities.keys());
  }
}
