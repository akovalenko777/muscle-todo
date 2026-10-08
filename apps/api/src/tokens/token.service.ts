import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { IUser } from "../types/user.js";
import { randomUUID } from 'node:crypto';
import ms from 'ms';
import { createHash } from "node:crypto";

@Injectable()
export class TokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  generateTokens(user: IUser) {
    const payload = { sub: user.id, username: user.email, jti: randomUUID(), role: user.role }
    const expiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as JwtSignOptions['expiresIn']
    const expiresAt = new Date(new Date().getTime() + ms(expiresIn as ms.StringValue))
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn
    })
    const refreshHash = createHash('sha256').update(refreshToken).digest('hex')
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as JwtSignOptions['expiresIn']
      }),
      refreshToken,
      expiresAt,
      refreshHash
    }
  }

  async upsertRefreshToken(user: IUser) {
    const { refreshToken, accessToken, expiresAt, refreshHash } = this.generateTokens(user)

    await this.prisma.refreshToken.upsert({
      where: { userId: user.id },
      update: {
        refreshHash,
        expiresAt
      },
      create: {
        userId: user.id,
        refreshHash,
        expiresAt
      }
    })

    return {
      accessToken,
      refreshToken,
      user
    }
  }

  async revokeRefreshToken(userId: string) {
    return await this.prisma.refreshToken.deleteMany({
      where: { userId }
    })
  }
}