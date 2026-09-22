import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { registerAndLogin } from './utils/auth-helper.js';
import { createValidationPipe } from '../src/config/validation-pipe.js';

describe('Tags (e2e)', () => {
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
  
      const auth = await registerAndLogin(app, {email: 'admin@localhost.com'})
      accessToken = auth.accessToken
    })
  
    describe('Tags flow', () => {
      it("create tag and link it to test", async () => {
        const createTagResponse = await request(app.getHttpServer())
          .post('/tags')
          .set('Authorization', `bearer ${accessToken}`)
          .send({
            text: `work-${new Date().getTime()}`,
            color: '#FF0000'
          })
          .expect(201)

        await request(app.getHttpServer())
          .post('/tasks')
          .set('Authorization', `bearer ${accessToken}`)
          .send({
            title: 'Test task',
            description: 'Test description',
            tagIds: [createTagResponse.body.id]
          })
          .expect(201)

        await request(app.getHttpServer())
          .delete(`/tags/${createTagResponse.body.id}`)
          .set('Authorization', `bearer ${accessToken}`)
          .expect(400)
      })
    })
})