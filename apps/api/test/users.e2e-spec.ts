import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  const userShape = expect.objectContaining({
    id: expect.any(String),
    email: expect.any(String),
    name: expect.any(String),
    createdAt: expect.any(String)
  })

  const testUser = {
    email: 'new-test@test.com',
    name: 'Test User',
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

    const auth = await registerAndLogin(app)
    accessToken = auth.accessToken
  })

  describe('Users flow', () => {
    it('create a user', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
        .then((response) => {
          expect(response.body).not.toHaveProperty('passwordHash')
        })
    })

    it('create a user with existed email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)

      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(400)
    })

    it('get users list', async () => {
      const { status, body } =  await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `bearer ${accessToken}`)
        expect(status).toBe(200)
        expect(body).toStrictEqual(expect.arrayContaining([userShape]))
        body.forEach((user: unknown) => {
          expect(user).not.toHaveProperty('passwordHash')
        })
    })

    it('update user name', async () => {
      const newName = 'New User Name'
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
      const { status, body } = await request(app.getHttpServer())
        .patch(`/users/${userResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          name: newName
        })
        expect(status).toBe(200)
        expect(body.name).toBe(newName)
    })

    it('update user password', async () => {
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
      await request(app.getHttpServer())
        .patch(`/users/${userResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          password: 'newPass'
        })
        .expect(400)
    })

    it('delete user', async () => {
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
      await request(app.getHttpServer())
        .delete(`/users/${userResponse.body.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204)
    })

  })
})