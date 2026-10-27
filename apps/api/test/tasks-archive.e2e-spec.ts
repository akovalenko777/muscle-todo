import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

type ArchiveResponse = { tasks: { id: string, title: string, archived: boolean }[], count: number }

describe('Tasks archive (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany()
    // task deletion cascades TaskTag rows, so tags can be removed afterwards
    await prisma.task.deleteMany()
    await prisma.tag.deleteMany()

    const auth = await registerAndLogin(app)
    accessToken = auth.accessToken
    userId = auth.userId
  })

  // Seeds via Prisma directly: archived/completedAt can't be set through the HTTP API
  function createArchivedTask(title: string, options: {
    assigneeId?: string | null,
    description?: string,
    archived?: boolean,
    tagIds?: string[],
    createdAt?: Date,
  } = {}) {
    const { assigneeId = null, description = 'Test task', archived = true, tagIds = [], createdAt } = options
    return prisma.task.create({
      data: {
        title,
        description,
        status: 'DONE',
        createdAt: createdAt ?? new Date('2026-10-10T00:00:00Z'),
        completedAt: new Date('2026-10-15T00:00:00Z'),
        archived,
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
        tags: { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) },
      }
    })
  }

  function getArchive(token: string, query: Record<string, string | undefined> = {}) {
    return request(app.getHttpServer())
      .get('/tasks/archive')
      .query(query)
      .set('Authorization', `bearer ${token}`)
  }

  function ids(body: ArchiveResponse) {
    return body.tasks.map((task) => task.id)
  }

  describe('GET /tasks/archive', () => {
    it('USER sees only own and unassigned archived tasks', async () => {
      const other = await registerAndLogin(app, { email: 'other-user@test.com' })
      const ownTask = await createArchivedTask('Own task', { assigneeId: userId })
      const unassignedTask = await createArchivedTask('Unassigned task')
      const otherTask = await createArchivedTask('Other user task', { assigneeId: other.userId })

      const response = await getArchive(accessToken).expect(200)
      const body = response.body as ArchiveResponse

      expect(ids(body).sort()).toStrictEqual([ownTask.id, unassignedTask.id].sort())
      expect(body.count).toBe(2)
      expect(JSON.stringify(body)).not.toContain(otherTask.id)
    })

    it('USER cannot see another user\'s archived tasks via assigneeId', async () => {
      const other = await registerAndLogin(app, { email: 'other-user@test.com' })
      const ownTask = await createArchivedTask('Own task', { assigneeId: userId })
      const otherTask = await createArchivedTask('Other user task', { assigneeId: other.userId })

      const response = await getArchive(accessToken, { assigneeId: other.userId }).expect(200)
      const body = response.body as ArchiveResponse

      // parameter is ignored for USER role: own tasks still returned, other's never
      expect(ids(body)).toStrictEqual([ownTask.id])
      expect(body.count).toBe(1)
      expect(JSON.stringify(body)).not.toContain(otherTask.id)
    })

    it('ADMIN sees archived tasks of all users and can filter by assigneeId', async () => {
      const admin = await registerAndLogin(app, { email: 'admin@localhost.com' })
      const other = await registerAndLogin(app, { email: 'other-user@test.com' })
      const userTask = await createArchivedTask('User task', { assigneeId: userId })
      const otherTask = await createArchivedTask('Other user task', { assigneeId: other.userId })
      const unassignedTask = await createArchivedTask('Unassigned task')

      const allResponse = await getArchive(admin.accessToken).expect(200)
      expect(ids(allResponse.body).sort()).toStrictEqual([userTask.id, otherTask.id, unassignedTask.id].sort())
      expect(allResponse.body.count).toBe(3)

      const filteredResponse = await getArchive(admin.accessToken, { assigneeId: other.userId }).expect(200)
      expect(ids(filteredResponse.body)).toStrictEqual([otherTask.id])
      expect(filteredResponse.body.count).toBe(1)
    })

    it('returns only archived tasks', async () => {
      const archivedTask = await createArchivedTask('Archived task', { assigneeId: userId })
      const doneTask = await createArchivedTask('Done not archived', { assigneeId: userId, archived: false })

      const response = await getArchive(accessToken).expect(200)
      const body = response.body as ArchiveResponse

      expect(ids(body)).toStrictEqual([archivedTask.id])
      expect(body.count).toBe(1)
      expect(ids(body)).not.toContain(doneTask.id)
      body.tasks.forEach((task) => {
        expect(task.archived).toBe(true)
      })
    })

    it('search matches title or description case-insensitively', async () => {
      const byTitle = await createArchivedTask('fix login bug', { assigneeId: userId })
      const byDescription = await createArchivedTask('Some task', { assigneeId: userId, description: 'the login form is broken' })
      await createArchivedTask('Unrelated task', { assigneeId: userId, description: 'nothing here' })

      const response = await getArchive(accessToken, { search: 'LoGiN' }).expect(200)
      const body = response.body as ArchiveResponse

      expect(ids(body).sort()).toStrictEqual([byTitle.id, byDescription.id].sort())
      expect(body.count).toBe(2)
    })

    it('filters by tags (any of the given tag ids)', async () => {
      const tagA = await prisma.tag.create({ data: { text: 'archive-tag-a' } })
      const tagB = await prisma.tag.create({ data: { text: 'archive-tag-b' } })
      const tagC = await prisma.tag.create({ data: { text: 'archive-tag-c' } })

      const withA = await createArchivedTask('Task A', { assigneeId: userId, tagIds: [tagA.id] })
      const withB = await createArchivedTask('Task B', { assigneeId: userId, tagIds: [tagB.id] })
      const withAC = await createArchivedTask('Task A+C', { assigneeId: userId, tagIds: [tagA.id, tagC.id] })
      await createArchivedTask('Task C', { assigneeId: userId, tagIds: [tagC.id] })
      await createArchivedTask('Task without tags', { assigneeId: userId })

      const response = await getArchive(accessToken, { tags: `${tagA.id},${tagB.id}` }).expect(200)
      const body = response.body as ArchiveResponse

      expect(ids(body).sort()).toStrictEqual([withA.id, withB.id, withAC.id].sort())
      expect(body.count).toBe(3)
    })

    it('paginates and returns total count of matching rows', async () => {
      const created: string[] = []
      for (let i = 0; i < 7; i++) {
        const task = await createArchivedTask(`Task ${i}`, {
          assigneeId: userId,
          createdAt: new Date(Date.UTC(2026, 9, 1 + i)),
        })
        created.push(task.id)
      }
      // ordered by createdAt desc: newest first
      const expectedOrder = [...created].reverse()

      const page1 = await getArchive(accessToken, { page: '1', pageSize: '3' }).expect(200)
      expect(ids(page1.body)).toStrictEqual(expectedOrder.slice(0, 3))
      expect(page1.body.count).toBe(7)

      const page3 = await getArchive(accessToken, { page: '3', pageSize: '3' }).expect(200)
      expect(ids(page3.body)).toStrictEqual(expectedOrder.slice(6))
      expect(page3.body.count).toBe(7)
    })

    it.each([
      { page: 'abc' },
      { pageSize: 'abc' },
    ])('rejects non-numeric pagination: %o', async (query) => {
      await getArchive(accessToken, query).expect(400)
    })

    it('clamps zero/negative page and pageSize to defaults (page 1, pageSize 5)', async () => {
      const created: string[] = []
      for (let i = 0; i < 7; i++) {
        const task = await createArchivedTask(`Task ${i}`, {
          assigneeId: userId,
          createdAt: new Date(Date.UTC(2026, 9, 1 + i)),
        })
        created.push(task.id)
      }
      const firstDefaultPage = [...created].reverse().slice(0, 5)

      for (const query of [{ page: '0' }, { page: '-1' }, { pageSize: '0' }, { pageSize: '-3' }]) {
        const response = await getArchive(accessToken, query).expect(200)
        expect(ids(response.body)).toStrictEqual(firstDefaultPage)
        expect(response.body.count).toBe(7)
      }
    })
  })
})
