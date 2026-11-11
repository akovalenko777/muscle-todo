import { NestApplication } from "@nestjs/core"
import { PrismaService } from "../src/prisma/prisma.service.js"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../src/app.module.js"
import { createValidationPipe } from "../src/config/validation-pipe.js"
import { registerAndLogin } from "./utils/auth-helper.js"
import request from 'supertest';
import { dateOnly } from "../src/helpers/functions.js"
import { QuickTasksLogService } from "../src/quick_tasks_log/quick_tasks_log.service.js"

describe('Quick tasks log', () => {
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
  
    describe('Loging quick tasks', () => {
      it('Log quick tasks', async () => {
        const date = dateOnly(new Date())
        const expectedTomorrow = dateOnly(new Date(date.getTime() + 86400000))
        const doneTask = await prisma.quickTask.create({
          data: {
            title: 'Quick task title 1',
            date: date,
            done: true,
            user: {
              connect: { id: userId }
            }
          }
        })
        const undoneTask = await prisma.quickTask.create({
          data: {
            title: 'Quick task title 2',
            date: date,
            done: false,
            user: {
              connect: { id: userId }
            }
          }
        })
        await app.get(QuickTasksLogService).rolloverDailyTasks()

        await request(app.getHttpServer())
          .get('/quick_tasks/' + doneTask.id)
          .set('Authorization', `bearer ${accessToken}`)
          .expect(404)
        const getResponse = await request(app.getHttpServer())
          .get('/quick_tasks/' + undoneTask.id)
          .set('Authorization', `bearer ${accessToken}`)
          .expect(200)
        expect(getResponse.body.done).toBeFalsy()
        expect(new Date(getResponse.body.date).toISOString().slice(0, 10)).toBe(expectedTomorrow.toISOString().slice(0, 10))

        const quickTasksLogResponse = await prisma.quickTaskDailyLog.findUnique({
          where: { userId_date: { userId, date } }
        })
        expect(quickTasksLogResponse?.doneTasks).toBe(1)
        expect(quickTasksLogResponse?.totalTasks).toBe(2)
        expect(quickTasksLogResponse?.list).toEqual(
          expect.arrayContaining([
            { title: 'Quick task title 1', done: true },
            { title: 'Quick task title 2', done: false }
          ])
        )
      })
    })
})