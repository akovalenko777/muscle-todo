import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

describe('Users account (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: 'new-test@test.com',
    name: 'Test User',
    password: 'Aa1'
  }

  const testAdmin = {
    email: 'admin@localhost.com',
    name: 'Test Admin',
    password: 'Aa1'
  }

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
  })

  describe('Users flow', () => {
    it('create a admin user and try change role', async () => {
      const { userId, accessToken: adminAccessToken } = await registerAndLogin(app, testAdmin)
      // change admin role
      await request(app.getHttpServer())
        .patch('/users/'+userId)
        .set('Authorization', `bearer ${adminAccessToken}`)
        .send({
          role: 'USER'
        })
        .expect(400)
    })

    it('check task assignee after deleting user', async () => {
      //create and auth regular user
      const { userId, accessToken: userAccessToken } = await registerAndLogin(app, testUser)
      // create new task
      const taskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `bearer ${userAccessToken}`)
        .send({
          title: 'Test task',
          description: 'Test task description',
        })
        .expect(201)
      expect(taskResponse.body.assigneeId).toBe(userId)
      const taskId = taskResponse.body.id
      // create and auth admin
      const { accessToken: adminAccessToken } = await registerAndLogin(app, testAdmin)
      // remove user
      await request(app.getHttpServer())
        .delete('/users/'+userId)
        .set('Authorization', `bearer ${adminAccessToken}`)
        .expect(204)
      // check task assigneeId
      await request(app.getHttpServer())
        .get('/tasks/'+taskId)
        .set('Authorization', `bearer ${adminAccessToken}`)
        .expect(200)
        .then((resp) => {
          expect(resp.body.id).toBe(taskId)
          expect(resp.body.assigneeId).toBe(null)
        })
    })
    it('admin can promote user to ADMIN and demote back to USER', async () => {
      // create and auth admin
      const { accessToken: adminAccessToken } = await registerAndLogin(app, testAdmin)
      // create regular user
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `bearer ${adminAccessToken}`)
        .send(testUser)
        .expect(201)
      const userId = userResponse.body.id
      // set ADMIN role to user
      await request(app.getHttpServer())
        .patch('/users/'+userId)
        .set('Authorization', `bearer ${adminAccessToken}`)
        .send({ role: 'ADMIN' })
        .expect(200)
        .then((resp) => {
          expect(resp.body.role).toBe('ADMIN')
        })
      // set USER role to other admin
      await request(app.getHttpServer())
        .patch('/users/'+userId)
        .set('Authorization', `bearer ${adminAccessToken}`)
        .send({ role: 'USER' })
        .expect(200)
        .then((resp) => {
          expect(resp.body.role).toBe('USER')
        })
    })

  })
})