import { Global, Module } from "@nestjs/common";
import { OmniAiService } from "./omni-ai.service";

@Global()
@Module({
  providers: [OmniAiService],
  exports: [OmniAiService],
})
export class OmniAiModule {}
