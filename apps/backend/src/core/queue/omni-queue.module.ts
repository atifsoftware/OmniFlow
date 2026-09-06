import { Global, Module } from "@nestjs/common";
import { OmniQueueService } from "./omni-queue.service";
import { QueueWorkerService } from "./queue-worker.service";

@Global()
@Module({
  providers: [OmniQueueService, QueueWorkerService],
  exports: [OmniQueueService, QueueWorkerService],
})
export class OmniQueueModule {}
