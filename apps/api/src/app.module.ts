import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { RoleGuard } from './auth/roles.guard.js';
import { AppService } from './app.service.js';
import { TagsModule } from './tags/tags.module.js';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, TasksModule, UsersModule, AuthModule, TagsModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard
    }
],
})
export class AppModule {}
