import { Global, Module } from "@nestjs/common";
import { OmniImageService } from "./omni-image.service";

@Global()
@Module({
  providers: [OmniImageService],
  exports: [OmniImageService],
})
export class OmniImageModule {}
