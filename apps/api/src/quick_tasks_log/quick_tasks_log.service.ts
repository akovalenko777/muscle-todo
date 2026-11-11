import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Cron, CronExpression } from "@nestjs/schedule";
import { QuickTask } from "../generated/prisma/client.js";
import { dateOnly, groupBy } from "../helpers/functions.js";

@Injectable()
export class QuickTasksLogService {
  private readonly logger = new Logger(QuickTasksLogService.name)

  constructor(
    private readonly prisma: PrismaService
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Europe/Kyiv' })
  async handleCron(){
    try {
      await this.rolloverDailyTasks()
    } catch (error: unknown) {
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error('Cron job for archive tasks failed.', stack)
    }
  }

  async rolloverDailyTasks() {
    const today = dateOnly(new Date())
    const tomorrow = dateOnly(new Date(Date.now() + 86400000))

    await this.prisma.$transaction(async (tx) => {
      const tasks = await tx.quickTask.findMany({ where: { date: today } })
      const byUser = groupBy<QuickTask>(tasks, t => t.userId)

      for (const [userId, userTasks] of Object.entries(byUser)) {
        const data = {
          totalTasks: userTasks.length,
          doneTasks: userTasks.filter(t => t.done).length,
          list: userTasks.map(t => ({ title: t.title, done: t.done }))
        }
        await tx.quickTaskDailyLog.upsert({
          where: { userId_date: { userId, date: today } },
          create: { userId, date: today, ...data },
          update: data
        })
      }

      await tx.quickTask.deleteMany({ where: { date: today, done: true } })
      await tx.quickTask.updateMany({ where: { date: today, done: false }, data: { date: tomorrow } })
    })
  }
}