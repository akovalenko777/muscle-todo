import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QuickTasksService } from "./quick_tasks.service.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { CreateQuickTaskDto } from "./dto/create-quick_task.dto.js";
import { UpdateQuickTaskDto } from "./dto/update-quick_task.dto.js";

@ApiTags('quick_tasks')
@ApiBearerAuth()
@Controller('quick_tasks')

export class QuickTasksController {
  constructor (private readonly quickTasksService: QuickTasksService){}

  @Get()
  findAll(
    @CurrentUser() user: { userId: string }
  ) {
    return this.quickTasksService.findAll(user.userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string },) {
    return this.quickTasksService.findOne(id, user.userId)
  }

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateQuickTaskDto
  ) {
    return this.quickTasksService.create(dto, user.userId)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateQuickTaskDto
  ) {
    return this.quickTasksService.update(id, dto, user.userId)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.quickTasksService.remove(id, user.userId)
  }
}