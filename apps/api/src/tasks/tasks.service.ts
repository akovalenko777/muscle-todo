import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

const ownerInclude = {
  owners: {
    include: {
      user: {
        select: { id: true, email: true, name: true, createdAt: true },
      },
    },
  },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      include: ownerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: ownerInclude,
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto) {
    const { ownerIds, ...data } = dto;
    try {
      return await this.prisma.task.create({
        data: {
          ...data,
          owners: ownerIds
            ? { create: ownerIds.map((userId) => ({ user: { connect: { id: userId } } })) }
            : undefined,
        },
        include: ownerInclude,
      });
    } catch (error) {
      // Nested `connect` on a missing user surfaces as P2025 here (not P2003 -
      // that's only for the raw FK violation createMany hits in `update`).
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BadRequestException('One or more ownerIds do not exist');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTaskDto) {
    const { ownerIds, ...data } = dto;
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (ownerIds !== undefined) {
          await tx.taskOwner.deleteMany({
            where: { taskId: id, userId: { notIn: ownerIds } },
          });
          if (ownerIds.length > 0) {
            await tx.taskOwner.createMany({
              data: ownerIds.map((userId) => ({ taskId: id, userId })),
              skipDuplicates: true,
            });
          }
        }
        return tx.task.update({
          where: { id },
          data,
          include: ownerInclude,
        });
      });
    } catch (error) {
      throw this.mapTaskError(error, id);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      throw this.mapTaskError(error, id);
    }
  }

  /** For update/remove: P2025 here means the task itself wasn't found. */
  private mapTaskError(error: unknown, id: string) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NotFoundException(`Task ${id} not found`);
      }
      if (error.code === 'P2003') {
        return new BadRequestException('One or more ownerIds do not exist');
      }
    }
    return error;
  }
}
