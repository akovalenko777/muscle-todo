import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TaskStatus, UserRole } from '../generated/prisma/client.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Query('status', new ParseEnumPipe(TaskStatus, { optional: true }))
    status?: TaskStatus,
  ) {
    return this.tasksService.findAll(user.userId, user.role, status);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Param('id') id: string) {
    return this.tasksService.findOne(id, user.userId, user.role);
  }

  @Post()
  create(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto, user.userId, user.role);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto, user.userId, user.role);
  }

  @Patch(':id/claim')
  claim(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Param('id') id: string) {
    return this.tasksService.claim(id, user.userId, user.role);
  }

  @Patch(':id/reset')
  reset(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Param('id') id: string) {
    return this.tasksService.reset(id, user.userId, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: { userId: string, role: UserRole },
    @Param('id') id: string) {
    return this.tasksService.remove(id, user.userId, user.role);
  }
}
