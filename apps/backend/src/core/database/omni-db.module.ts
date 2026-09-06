import { Global, Module } from "@nestjs/common";
import { OmniDbService } from "./omni-db.service";

/**
 * OmniDB Module — Global database module
 * Provides OmniDbService to all modules without importing it everywhere.
 */
@Global()
@Module({
  providers: [OmniDbService],
  exports: [OmniDbService],
})
export class OmniDbModule {}
