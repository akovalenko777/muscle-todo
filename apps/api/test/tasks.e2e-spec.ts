import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
  })
})