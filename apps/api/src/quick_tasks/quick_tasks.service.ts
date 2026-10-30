import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma } from '../generated/prisma/client.js';
import { CreateQuickTaskDto } from "./dto/create-quick_task.dto.js";
import { UpdateQuickTaskDto } from "./dto/update-quick_task.dto.js";

@Injectable()

export class QuickTasksService {
  constructor(private readonly prisma: PrismaService){}

  findAll(userId: string) {
    return this.prisma.quickTask.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { done: 'desc' }]
    })
  }

  async findOne(id: string, userId: string) {
    const qtask = await this.prisma.quickTask.findUnique({ where: { id } })
    if(!qtask) {
      throw new NotFoundException(`Quick task with id ${id} not found`)
    }
    if (qtask.userId !== userId){
      throw new ForbiddenException('You can only get tasks assigned to you');
    }
    return qtask
  }

  async create(dto: CreateQuickTaskDto, userId: string) {
    try {
      return await this.prisma.quickTask.create({
        data: {
          title: dto.title,
          user: {
            connect: { id: userId }
          }
        }
      })
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, dto: UpdateQuickTaskDto, userId: string) {
    try {
      // check userId
      const task = await this.findOne(id, userId)
      if (task?.userId !== userId){
        throw new ForbiddenException('You can only edit tasks assigned to you');
      }
      
      return await this.prisma.quickTask.update({
        where: { id },
        data: { ...dto }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Quick task with ${id} not found for update`)
      }
      throw error
    }
  }

  async remove(id: string, userId: string) {
    try {
      // check userId
      const task = await this.findOne(id, userId)
      if (task?.userId !== userId){
        throw new ForbiddenException('You can only delete tasks assigned to you');
      }

      return await this.prisma.quickTask.delete({ where: { id } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Quick task with ${id} not found for delete`)
      }
      throw error
    }
  }
}