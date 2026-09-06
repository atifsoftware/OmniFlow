import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY, REQUIRE_ABILITY_KEY } from "./api-token.guard";

/**
 * Mark a route as publicly accessible (no token required)
 * @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Require a specific token ability for a route
 * @RequireAbility("read:orders")
 */
export const RequireAbility = (ability: string) => SetMetadata(REQUIRE_ABILITY_KEY, ability);
