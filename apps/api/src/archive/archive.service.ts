import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class ArchiveService {
  private readonly logger = new Logger(ArchiveService.name)

  constructor(
    private readonly prisma: PrismaService
  ){}

  @Cron('0 0 */2 * * *')
  async handleCron(){
    try {
      await this.archiveTasks(Date.now())
    } catch (error: unknown) {
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error('Cron job for archive tasks failed.', stack)
    }
  }

  async archiveTasks(now: number){
    const yesterday = new Date(now - 864e5)
    return this.prisma.task.updateMany({
      data: { archived: true },
      where: { status: 'DONE', archived: false, completedAt: { lt: yesterday } }
    })
  }
}