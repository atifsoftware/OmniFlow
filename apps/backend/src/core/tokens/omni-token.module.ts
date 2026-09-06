import { Global, Module } from "@nestjs/common";
import { OmniTokenService } from "./omni-token.service";
import { ApiTokenGuard } from "./api-token.guard";
import { TokenController } from "./token.controller";

@Global()
@Module({
  controllers: [TokenController],
  providers: [OmniTokenService, ApiTokenGuard],
  exports: [OmniTokenService, ApiTokenGuard],
})
export class OmniTokenModule {}
