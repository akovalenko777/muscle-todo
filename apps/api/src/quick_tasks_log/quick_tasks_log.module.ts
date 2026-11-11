import { Module } from "@nestjs/common";
import { ScheduleModule } from '@nestjs/schedule';
import { QuickTasksLogService } from "./quick_tasks_log.service.js";

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  providers: [QuickTasksLogService]
})

export class QuickTasksLogModule {}