import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';
import { ArchiveService } from '../src/archive/archive.service.js';

describe('Tasks (e2e)', () => {
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
    await prisma.task.deleteMany()

    const auth = await registerAndLogin(app)
    accessToken = auth.accessToken
    userId = auth.userId
  })

  describe('Tasks flow', () => {
    it('create a task', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test task',
          description: 'Test task description',
        })
        .expect(201)
    })

    it('rejects task creation without required title', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          description: 'Test task description',
        })
        .expect(400)
    });

    it('get tasks list without rows', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .query({ status: 'PLANNED' })
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toStrictEqual([])
        })
    })

    it('get tasks list', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test task',
          description: 'Test task description',
        })
        .expect(201)

      await request(app.getHttpServer())
        .get('/tasks')
        .query({ status: 'PLANNED' })
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).not.toStrictEqual([])
        })
    })

    it('get one task', async () => {
      const createTaskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test task',
          description: 'Test task description',
        })
        .expect(201)

      await request(app.getHttpServer())
        .get(`/tasks/${createTaskResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createTaskResponse.body.id)
        })
    })

    it('get one task with invalid ID', async () => {
      await request(app.getHttpServer())
        .get(`/tasks/invalid_task_id`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(404)
    })

    it('update task status', async () => {
      const createTaskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test task',
          description: 'Test task description',
        })
        .expect(201)

      await request(app.getHttpServer())
        .patch(`/tasks/${createTaskResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test task UPD!',
          status: 'IN_PROGRESS'
        })
        .expect(200)
        .then((response) => {
          expect(response.body.title).toBe('Test task UPD!')
          expect(response.body.status).toBe('IN_PROGRESS')
        })

      await request(app.getHttpServer())
        .patch(`/tasks/${createTaskResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          status: 'INVALID_STATUS'
        })
        .expect(400)

    })

    it('returns 404 (not 400) when ADMIN updates tagIds on a non-existent task', async () => {
      const admin = await registerAndLogin(app, { email: 'admin@localhost.com' })
      await request(app.getHttpServer())
        .patch('/tasks/invalid_id')
        .set('Authorization', `bearer ${admin.accessToken}`)
        .send({ tagIds: ['some-tag-id'] })
        .expect(404)
    })

    it('delete task', async () => {
      const createTaskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test task',
          description: 'Test task description',
        })
        .expect(201)

      await request(app.getHttpServer())
        .delete(`/tasks/${createTaskResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204)
    })

    it('delete task with invalid ID', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/invalid_task_id`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(404)
    })

    it('sanitizes malicious HTML in description', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description: '<p>Safe text</p><script>alert("xss")</script><img src=x onerror="alert(1)">'
        })
        .expect(201)

      expect(response.body.description).not.toContain('<script>')
      expect(response.body.description).not.toContain('onerror')
      expect(response.body.description).toContain('Safe text')
    })

    it('check allowed HTML tags with attributes', async () => {
      const description = '<p style="text-align:center">x</p><h2 style="text-align:right">x</h2><p><u>x</u></p><p><span style="color:#ff0000">x</span></p>'
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description
        })
        .expect(201)
      expect(response.body.description).toBe(description)
    })

    it('disallow any links in description', async () => {
      const description = '<p style="text-align:center">Some text with <a href="https://somesite.com">link</a></p>'
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description
        })
        .expect(201)
      expect(response.body.description).not.toContain('<a href=')
    })

    it('remove suspicious styles from description', async () => {
      const description = '<p style="color:#ff0000;background:url(javascript:alert(1))">x</p>'
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description
        })
        .expect(201)
      expect(response.body.description).not.toContain('background')
      expect(response.body.description).not.toContain('alert')
      expect(response.body.description).toContain('color:')
    })

    it.each(['<p></p>', '<p><br /></p>', '<pre></pre>', '<hr>'])('unable to create task with description: %s', async (description) => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description
        })
        .expect(400)
    })

    it('unable to update task with empty description', async () => {
      const description = 'test'
      const responseCreate = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description
        })
        .expect(201)

      await request(app.getHttpServer())
        .patch('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          description: '<p></p>'
        })
        .expect(400)
      const after = await request(app.getHttpServer())
        .get('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      expect(after.body.description).toBe('test')
    })

    it('check completedAt after changing statuses', async () => {
      const responseCreate = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'Test',
          description: 'test'
        })
        .expect(201)

      //update status to DONE
      const responseUpdate1 = await request(app.getHttpServer())
        .patch('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          status: 'DONE'
        })
        .expect(200)
      expect(responseUpdate1.body.status).toBe('DONE')
      expect(responseUpdate1.body.completedAt).not.toBeNull()
      expect(new Date(responseUpdate1.body.completedAt).getTime()).not.toBeNaN()

      const responseUpdate1_1 = await request(app.getHttpServer())
        .patch('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          title: 'New title'
        })
        .expect(200)
      expect(responseUpdate1_1.body.status).toBe('DONE')
      expect(responseUpdate1_1.body.completedAt).toBe(responseUpdate1.body.completedAt)

      //set DONE to already donned task
      const responseUpdate1_2 = await request(app.getHttpServer())
        .patch('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          status: 'DONE'
        })
        .expect(200)
      expect(responseUpdate1_2.body.status).toBe('DONE')
      expect(responseUpdate1_2.body.completedAt).toBe(responseUpdate1.body.completedAt)

      //update status to IN_PROGRESS
      const responseUpdate2 = await request(app.getHttpServer())
        .patch('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          status: 'IN_PROGRESS'
        })
        .expect(200)
      expect(responseUpdate2.body.status).toBe('IN_PROGRESS')
      expect(responseUpdate2.body.completedAt).toBeNull()

      //update status to REVIEWED
      const responseUpdate3 = await request(app.getHttpServer())
        .patch('/tasks/' + responseCreate.body.id)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          status: 'REVIEWED'
        })
        .expect(200)
      expect(responseUpdate3.body.status).toBe('REVIEWED')
      expect(responseUpdate3.body.completedAt).toBeNull()
    })

    it('archive task', async () => {
      const archiveService = app.get(ArchiveService)
      // normal old task - must be archived
      const task1Data = await prisma.task.create({
        data: {
          title: 'Test task 1',
          description: 'Test task',
          status: 'DONE',
          createdAt: new Date('2026-10-10T00:00:00Z'),
          completedAt: new Date('2026-10-15T00:00:00Z'),
          assignee: { connect: { id: userId } }
        }
      })

      // normal fresh task - must not be archived
      const task2Data = await prisma.task.create({
        data: {
          title: 'Test task 2',
          description: 'Test task',
          status: 'DONE',
          createdAt: new Date('2026-10-10T00:00:00Z'),
          completedAt: new Date('2026-10-24T12:00:00Z'),
          assignee: { connect: { id: userId } }
        }
      })

      // not DONE completed task - must not be archived
      const task3Data = await prisma.task.create({
        data: {
          title: 'Test task 3',
          description: 'Test task',
          status: 'REVIEWED',
          createdAt: new Date('2026-10-10T00:00:00Z'),
          completedAt: new Date('2026-10-15T12:00:00Z'),
          assignee: { connect: { id: userId } }
        }
      })

      // already DONE and archived task - must be skipped (updatedAt - not changed)
      const task4Data = await prisma.task.create({
        data: {
          title: 'Test task 4',
          description: 'Test task',
          status: 'DONE',
          createdAt: new Date('2026-10-10T00:00:00Z'),
          completedAt: new Date('2026-10-15T12:00:00Z'),
          updatedAt: new Date('2026-10-16T12:00:00Z'),
          archived: true,
          assignee: { connect: { id: userId } }
        }
      })
      

      await archiveService.archiveTasks(new Date('2026-10-25T00:00:00Z').getTime())
      // get and check tasks tasks
      await request(app.getHttpServer())
        .get('/tasks/'+task1Data.id)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.archived).toBeTruthy()
        })
        

      await request(app.getHttpServer())
        .get('/tasks/'+task2Data.id)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.archived).toBeFalsy()
        })

      await request(app.getHttpServer())
        .get('/tasks/'+task3Data.id)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.archived).toBeFalsy()
        })

      await request(app.getHttpServer())
        .get('/tasks/'+task4Data.id)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.archived).toBeTruthy()
          expect(new Date(response.body.updatedAt).getTime()).toBe(new Date('2026-10-16T12:00:00Z').getTime())
        })
    })

    it('get unarchived task for dashboard', async () => {
      //created two tasks archived and not archived
      await prisma.task.create({
        data: {
          title: 'Test task 1',
          description: 'Test task',
          status: 'DONE',
          createdAt: new Date('2026-10-10T00:00:00Z'),
          completedAt: new Date('2026-10-15T00:00:00Z'),
          archived: true,
          assignee: { connect: { id: userId } }
        }
      })

      await prisma.task.create({
        data: {
          title: 'Test task 2',
          description: 'Test task',
          status: 'DONE',
          createdAt: new Date('2026-10-10T00:00:00Z'),
          assignee: { connect: { id: userId } }
        }
      })
      const tasksResponse = await request(app.getHttpServer())
        .get('/tasks/')
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      expect(tasksResponse.body.length).toBe(1)
      tasksResponse.body.forEach((task: { archived: boolean }) => {
        expect(task.archived).toBeFalsy()
      })
    })
  })
})