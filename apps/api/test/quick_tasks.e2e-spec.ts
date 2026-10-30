import { NestApplication } from "@nestjs/core"
import { PrismaService } from "../src/prisma/prisma.service.js"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../src/app.module.js"
import { createValidationPipe } from "../src/config/validation-pipe.js"
import { registerAndLogin } from "./utils/auth-helper.js"
import request from 'supertest';

describe('Quick tasks e2e', () => {
  let app: NestApplication
  let prisma: PrismaService
  let accessToken: string
  let userId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(createValidationPipe())
    await app.init()

    prisma = app.get(PrismaService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.quickTask.deleteMany()

    const auth = await registerAndLogin(app)
    accessToken = auth.accessToken
    userId = auth.userId
  })

  const createQuickTask = async (accessToken: string) => {
    return await request(app.getHttpServer())
      .post('/quick_tasks')
      .set('Authorization', `bearer ${accessToken}`)
      .send({
        title: 'Quick task title'
      })
      .expect(201)
  }

  describe('Quick tasks flow', () => {
    it('CRUD quick tasks', async () => {
      // create quick task
      const createResponse = await createQuickTask(accessToken)
      expect(createResponse.body.userId).toBe(userId)
      expect(createResponse.body.done).toBeFalsy()

      const qtaskId = createResponse.body.id
      
      // update quick task
      const updateResponse = await request(app.getHttpServer())
        .patch('/quick_tasks/' + qtaskId)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          done: true
        })
        .expect(200)
      expect(updateResponse.body.done).toBeTruthy()

      // get quick task
      const getResponse = await request(app.getHttpServer())
        .get('/quick_tasks/' + qtaskId)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      expect(getResponse.body.userId).toBe(userId)
      expect(getResponse.body.done).toBeTruthy()

      // delete quick task
      await request(app.getHttpServer())
        .delete('/quick_tasks/' + qtaskId)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204)

      await request(app.getHttpServer())
        .get('/quick_tasks/' + qtaskId)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(404)
    })

    it('check access to other tasks owners', async () => {
      const ownTask = await createQuickTask(accessToken)
      const otherUserAuth = await registerAndLogin(app, { email: 'other-user@test.com' })
      const otherAccessToken = otherUserAuth.accessToken
      const taskId = ownTask.body.id

      await request(app.getHttpServer())
        .get('/quick_tasks/' + taskId)
        .set('Authorization', `bearer ${otherAccessToken}`)
        .expect(403)

      await request(app.getHttpServer())
        .patch('/quick_tasks/' + taskId)
        .send({
          done: true
        })
        .set('Authorization', `bearer ${otherAccessToken}`)
        .expect(403)

      await request(app.getHttpServer())
        .delete('/quick_tasks/' + taskId)
        .set('Authorization', `bearer ${otherAccessToken}`)
        .expect(403)

      const taskData = await request(app.getHttpServer())
        .get('/quick_tasks/' + taskId)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      expect(taskData.body.done).toBeFalsy()
    })

    it('user retrieve only own tasks', async () => {
      await createQuickTask(accessToken)
      await createQuickTask(accessToken)
      const otherUserAuth = await registerAndLogin(app, { email: 'other-user@test.com' })
      const otherAccessToken = otherUserAuth.accessToken
      await createQuickTask(otherAccessToken)

      const tasksResponse = await request(app.getHttpServer())
        .get('/quick_tasks')
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
      expect(tasksResponse.body.length).toBe(2)
      tasksResponse.body.forEach((task: {userId: string}) => {
        expect(task.userId).toBe(userId)
      })
    })

  })
})