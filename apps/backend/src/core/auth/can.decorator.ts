import { SetMetadata } from "@nestjs/common";

export const CAN_KEY = "omni_can";

/**
 * @Can("edit-product") decorator
 * Use with OmniCanGuard to protect routes.
 */
export const Can = (...abilities: string[]) => SetMetadata(CAN_KEY, abilities);
