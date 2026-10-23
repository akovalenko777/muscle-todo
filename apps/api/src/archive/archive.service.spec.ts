import { Mock } from "vitest"
import { PrismaService } from "../prisma/prisma.service.js"
import { Test, TestingModule } from "@nestjs/testing"
import { ArchiveService } from "./archive.service.js"

describe('ArchiveService', () => {
  let prisma: { task: { updateMany: Mock } }
  let service: ArchiveService

  beforeEach(async () => {
    vi.resetAllMocks()
    prisma = { task: { updateMany: vi.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArchiveService,
        { provide: PrismaService, useValue: prisma },
      ]
    }).compile()

    service = module.get(ArchiveService)
  })

  it('archive tasks', async () => {
    const resolveResult = { count: 2 }
    prisma.task.updateMany.mockResolvedValue(resolveResult)
    await expect(
      service.archiveTasks(new Date('2026-01-02T00:00:00Z').getTime())
    ).resolves.toMatchObject(resolveResult)
    expect(prisma.task.updateMany).toHaveBeenCalledWith({
      data: { archived: true },
      where: {
        status: 'DONE',
        archived: false,
        completedAt: { lt: new Date('2026-01-01T00:00:00Z') }
      }
    })
  })
})