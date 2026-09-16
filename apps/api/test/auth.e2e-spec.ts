import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

  describe('Auth flow', () => {
    const testUser = {
      email: 'e2e-test@test.com',
      name: 'E2E Test',
      password: 'Aa1'
    }

    it('register a new user', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
        .then(response => {
          expect(response.body).not.toHaveProperty('passwordHash')
        })
    })

    it('logs in and receives token pair', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('accessToken')
          expect(response.body).toHaveProperty('refreshToken')
        })
    });

    it('rejects access to protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(401)
    });

    it('allows access to protected route with valid token', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)

      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `bearer ${response.body.accessToken}`)
        .query({
          status: 'PLANNED'
        })
        .expect(200)
    });

    it('rotates refresh token and invalidates the old one', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)

      const REFRESH_TOKEN = response.body.refreshToken
      let NEW_REFRESH_TOKEN = ''

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: REFRESH_TOKEN
        })
        .expect(200)
        .then((resp) => {
          expect(response.body).toHaveProperty('accessToken')
          expect(response.body).toHaveProperty('refreshToken')
          NEW_REFRESH_TOKEN = resp.body.refreshToken
        })

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: NEW_REFRESH_TOKEN
        })
        .expect(200)

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: REFRESH_TOKEN
        })
        .expect(401)
    });

  })


});