import { Module } from "@nestjs/common";
import { ScheduleModule } from '@nestjs/schedule';
import { ArchiveService } from "./archive.service.js";

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  providers: [ArchiveService]
})

export class ArchiveModule {}