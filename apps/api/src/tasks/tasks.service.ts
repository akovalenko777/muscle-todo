import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskWhereInput, TaskWhereUniqueInput } from '../generated/prisma/models.js';
import { isContainText, sanitizeDescription } from './helper/sanitizeDescription.js';
import { compareStatuses } from './helper/compareStatuses.js';
import { ArchiveTaskDto } from './dto/archive-task.dto.js';

const include = {
  assignee: {
    select: { id: true, name: true }
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
  constructor(private readonly prisma: PrismaService) { }

  findAll(userId: string, role: UserRole, status?: TaskStatus) {
    const where: TaskWhereInput = { archived: false }
    if (role === 'USER') {
      where.OR = [{ assigneeId: userId }, { assigneeId: null }]
    }
    if (status) {
      where.status = status
    }
    return this.prisma.task.findMany({
      where,
      include,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
  }

  async findAllArchived(dto: ArchiveTaskDto, userId: string, role: UserRole){
    let page = parseInt(dto.page || '1', 10)
    let pageSize = parseInt(dto.pageSize || '5', 10)
    if(page <= 0) page = 1
    if(pageSize <= 0) pageSize = 5
    if(pageSize > 50) pageSize = 50 // limit MAX page size

    const skip = (page - 1) * pageSize
    const where: TaskWhereInput = { archived: true }
    
    where.AND = [
      role === 'USER' ? { OR: [{  assigneeId: userId }, { assigneeId: null }] } : {},
      dto?.search ? { OR: [
        { title: { contains: dto.search, mode: 'insensitive' }},
        { description: { contains: dto.search, mode: 'insensitive' } }
      ] } : {}
    ]

    if (dto.tags) {
      where.tags = {
        some: { tagId: { in: dto.tags.split(',') } }
      }
    }

    if (dto.assigneeId && role === 'ADMIN') {
      where.assigneeId = dto.assigneeId
    }

    const [tasks, count] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        take: pageSize,
        skip,
        include,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({
        where
      })
    ])
    return { tasks, count }
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const where: TaskWhereUniqueInput = { id }
    if (role === 'USER') {
      where.assigneeId = userId
    }
    const task = await this.prisma.task.findUnique({
      where,
      include,
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto, userId: string, role: UserRole) {
    const { assigneeId, tagIds, description, ...data } = dto;
    const cleanDescription = sanitizeDescription(description)
    if(!isContainText(cleanDescription)) {
      throw new BadRequestException('Unable to save with empty description')
    }
    try {
      const dataForCreate: Prisma.TaskCreateInput = {
        ...data,
        description: cleanDescription,
        tags: tagIds
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined
      }
      if (role === 'USER') {
        dataForCreate.assignee = { connect: { id: userId } }
      } else if (role === 'ADMIN' && assigneeId) {
        dataForCreate.assignee = { connect: { id: assigneeId } }
      }
      return await this.prisma.task.create({
        data: dataForCreate,
        include,
      });
    } catch (error) {
      // Nested `connect` on a missing user surfaces as P2025
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BadRequestException('Assignee does not exist');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, role: UserRole) {
    const { tagIds, assigneeId, description, ...data } = dto;
    try {
      if (role === 'USER') {
        const task = await this.findOne(id, userId, role)
        if (task.assigneeId !== userId) {
          throw new ForbiddenException('You can only edit tasks assigned to you');
        }
        if (assigneeId !== undefined) {
          throw new BadRequestException('Unable to assign task. Use /claim for assigninig.');
        }
      } else if (tagIds !== undefined) {
        await this.findOne(id, userId, role)
      }

      const dataForUpdate: Prisma.TaskUpdateInput = {
        ...data
      }

      if (description !== undefined){
        if(isContainText(description)){
          dataForUpdate.description = sanitizeDescription(description)
        } else {
          throw new BadRequestException('Unable to update with empty description')
        }
      }

      if (role === 'ADMIN' && assigneeId !== undefined) {
        dataForUpdate.assignee = assigneeId === null
          ? { disconnect: true }
          : { connect: { id: assigneeId } }
      }

      if (data.status) {
        //get teask by ID and compare statuses
        const task = await this.prisma.task.findUnique({
          where: { id }
        })
        if(task){
          const completedAt = compareStatuses(task.status, data.status)
          if(completedAt !== undefined) {
            dataForUpdate.completedAt = completedAt
          }
        }
      }

      return await this.prisma.$transaction(async (tx) => {
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
          data: dataForUpdate,
          include,
        });
      });
    } catch (error) {
      throw this.mapTaskError(error, id);
    }
  }

  async remove(id: string, userId: string, role: UserRole) {
    const where: TaskWhereUniqueInput = { id }
    if (role === 'USER') {
      where.assigneeId = userId
    }
    try {
      await this.prisma.task.delete({ where });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Task ${id} not found`);
        }
      }
      throw error
    }
  }

  async claim(id: string, userId: string, role: UserRole) {
    try {
      return await this.prisma.task.update({
        where: { id, assigneeId: null },
        data: {
          assigneeId: userId
        },
        include
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        await this.findOne(id, userId, role)
        throw new ConflictException('Task already assigned');
      }
      throw error
    }
  }

  async reset(id: string, userId: string, role: UserRole) {
    try {
      return await this.prisma.task.update({
        where: { id, assigneeId: userId },
        data: {
          assigneeId: null
        },
        include
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const task = await this.findOne(id, userId, role)
        const message = task.assigneeId === null
          ? 'Task is already unassigned'
          : 'Task has been reassigned to someone else'
        throw new ConflictException(message);
      }
      throw error
    }
  }

  /** For update/remove: P2025 here means the task itself wasn't found. */
  private mapTaskError(error: unknown, id: string) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NotFoundException(`Task ${id} not found`);
      }
      if (error.code === 'P2003') {
        return new BadRequestException('One or more tagIds do not exist');
      }
    }
    return error;
  }
}
