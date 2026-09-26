import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

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
  })
})