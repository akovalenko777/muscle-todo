import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  it('update() should throw NotFoundException, not BadRequestException, when the task does not exist but ownerIds is provided in the body', async () => {
    const fkViolation = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed on the field: `taskId`',
      { code: 'P2003', clientVersion: '7.10.0' },
    );

    const tx = {
      taskOwner: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        createMany: vi.fn().mockRejectedValue(fkViolation),
      },
      task: {
        update: vi.fn(),
      },
    };

    const prisma = {
      task: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    const service = module.get(TasksService);

    await expect(
      service.update('nonexistent-id', { ownerIds: ['some-user-id'] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
