import { Global, Module } from "@nestjs/common";
import { OmniContextService } from "./context/omni-context.service";
import { OmniCacheService } from "./cache/omni-cache.service";
import { OmniStorageService } from "./storage/omni-storage.service";
import { StorageController } from "./storage/storage.controller";
import { OmniMailService } from "./notifier/omni-mail.service";
import { OmniSmsService } from "./notifier/omni-sms.service";
import { OmniDbModule } from "./database/omni-db.module";
import { OmniQueueModule } from "./queue/omni-queue.module";
import { OmniTokenModule } from "./tokens/omni-token.module";
import { OmniImageModule } from "./image/omni-image.module";
import { OmniAiModule } from "./ai/omni-ai.module";
import { GateService } from "./auth/gate.service";
import { OmniCanGuard } from "./auth/omni-can.guard";
import { OmniLoggerService } from "./logger/omni-logger.service";

@Global()
@Module({
  imports: [
    OmniDbModule,
    OmniQueueModule,
    OmniTokenModule,
    OmniImageModule,
    OmniAiModule,
  ],
  controllers: [StorageController],
  providers: [
    OmniContextService,
    OmniCacheService,
    OmniStorageService,
    OmniMailService,
    OmniSmsService,
    GateService,
    OmniCanGuard,
    OmniLoggerService,
  ],
  exports: [
    OmniContextService,
    OmniCacheService,
    OmniStorageService,
    OmniMailService,
    OmniSmsService,
    GateService,
    OmniCanGuard,
    OmniLoggerService,
    OmniDbModule,
    OmniQueueModule,
    OmniTokenModule,
    OmniImageModule,
    OmniAiModule,
  ],
})
export class OmniCoreModule {}
