import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

const include = {
  owners: {
    include: {
      user: {
        select: { id: true, email: true, name: true, createdAt: true },
      }
    },
  },
  tags: {
    include: {
      tag: {
        select: { id: true, text: true, color: true }
      }
    }
  }
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include,
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto) {
    const { ownerIds, tagIds, ...data } = dto;
    try {
      return await this.prisma.task.create({
        data: {
          ...data,
          owners: ownerIds
            ? { create: ownerIds.map((userId) => ({ user: { connect: { id: userId } } })) }
            : undefined,
          tags: tagIds
            ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
            : undefined,
        },
        include,
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
    const { ownerIds, tagIds, ...data } = dto;
    if (ownerIds !== undefined || tagIds !== undefined) {
      // createMany's P2003 below can't distinguish "task missing" from "ownerId
      // missing" (no reliable meta on the FK violation) - confirm the task
      // exists before touching TaskOwner rows at all.
      await this.findOne(id);
    }
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
        if (tagIds !== undefined) {
          await tx.taskTag.deleteMany({
            where: { taskId: id, tagId: { notIn: tagIds } },
          });
          if (tagIds.length > 0) {
            await tx.taskTag.createMany({
              data: tagIds.map((tagId) => ({ taskId: id, tagId })),
              skipDuplicates: true,
            });
          }
        }
        return tx.task.update({
          where: { id },
          data,
          include,
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
        if (error.meta?.field_name === 'TaskOwner_userId_fkey') {
          return new BadRequestException('One or more ownerIds do not exist');
        }
        if (error.meta?.field_name === 'TaskTag_tagId_fkey') {
          return new BadRequestException('One or more tagIds do not exist');
        }
      }
    }
    return error;
  }
}
