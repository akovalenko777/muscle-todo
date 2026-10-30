import { Module } from "@nestjs/common";
import { QuickTasksController } from "./quick_tasks.controller.js";
import { QuickTasksService } from "./quick_tasks.service.js";

@Module({
  controllers: [QuickTasksController],
  providers: [QuickTasksService]
})

export class QuickTasksModule {}