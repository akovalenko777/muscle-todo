import { Mock } from "vitest"
import { TasksService } from "./tasks.service.js"
import { Test, TestingModule } from "@nestjs/testing"
import { PrismaService } from "../prisma/prisma.service.js"

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
}

const userId = '1234567890'

describe('ArchiveTasksService', () => {
  let prisma: { task: { findMany: Mock, count: Mock }, $transaction: Mock }
  let service: TasksService

  beforeEach(async () => {
    vi.resetAllMocks()

    prisma = {
      task: { 
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0)
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises))
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
      ]
    }).compile()

    service = module.get(TasksService)
  })

  it('check where arguments for retrieve archived tasks for USER', async () => {
    const where = {
      archived: true,
      AND: [{ OR: [ {assigneeId: userId}, { assigneeId: null } ] }, {}],
    }
    await service.findAllArchived({}, userId, 'USER')
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where,
      take: 5,
      skip: 0,
      include,
      orderBy: { createdAt: 'desc' },  
    })
    expect(prisma.task.count).toHaveBeenCalledWith({
      where
    })
  })

  it('check where arguments for retrieve archived tasks for ADMIN', async () => {
    const assigneeId = '123123123123123'
    await service.findAllArchived({ assigneeId }, userId, 'ADMIN')
    const where = {
      archived: true,
      AND: [{}, {}],
      assigneeId
    }
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where,
      take: 5,
      skip: 0,
      include,
      orderBy: { createdAt: 'desc' },  
    })
    expect(prisma.task.count).toHaveBeenCalledWith({
      where
    })
  })

  it('check where arguments for retrieve archived tasks for USER with search', async () => {
    const search = 'some text'
    const where = {
      archived: true,
      AND: [
        { OR: [ {assigneeId: userId}, { assigneeId: null } ] },
        { OR: [
          { title: { contains: search, mode: 'insensitive' }},
          { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      ],
    }
    await service.findAllArchived({ search }, userId, 'USER')
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where,
      take: 5,
      skip: 0,
      include,
      orderBy: { createdAt: 'desc' },  
    })
    expect(prisma.task.count).toHaveBeenCalledWith({
      where
    })
  })

  it('check where arguments for retrieve archived tasks for USER with tags filtering', async () => {
    const tagsIds = 'tag1id,tag2id'
    const where = {
      archived: true,
      AND: [
        { OR: [ {assigneeId: userId}, { assigneeId: null } ] },
        {}],
      tags: { some: { tagId: { in: tagsIds.split(',') } } }
    }
    await service.findAllArchived({ tags: tagsIds }, userId, 'USER')
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where,
      take: 5,
      skip: 0,
      include,
      orderBy: { createdAt: 'desc' },  
    })
    expect(prisma.task.count).toHaveBeenCalledWith({
      where
    })
  })

  it('check where arguments for retrieve archived tasks for USER with pagination', async () => {
    const where = {
      archived: true,
      AND: [
        { OR: [ {assigneeId: userId}, { assigneeId: null } ] },
        {}]
    }
    await service.findAllArchived({ page: '2', pageSize: '5' }, userId, 'USER')
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where,
      take: 5,
      skip: 5,
      include,
      orderBy: { createdAt: 'desc' },  
    })
    expect(prisma.task.count).toHaveBeenCalledWith({
      where
    })
  })

  it('check where arguments for retrieve archived tasks for USER with assigneeId', async () => {
    const assigneeId = '123123123123123'
    const where = {
      archived: true,
      AND: [
        { OR: [ {assigneeId: userId}, { assigneeId: null } ] },
        {}]
    }
    await service.findAllArchived({ assigneeId }, userId, 'USER')
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where,
      take: 5,
      skip: 0,
      include,
      orderBy: { createdAt: 'desc' },  
    })
    expect(prisma.task.count).toHaveBeenCalledWith({
      where
    })
  })
})