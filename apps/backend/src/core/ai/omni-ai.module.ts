import { Global, Module } from "@nestjs/common";
import { OmniAiService } from "./omni-ai.service";
import { OmniAiController } from "./omni-ai.controller";

@Global()
@Module({
  controllers: [OmniAiController],
  providers: [OmniAiService],
  exports: [OmniAiService],
})
export class OmniAiModule {}
