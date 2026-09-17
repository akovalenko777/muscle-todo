import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { createHash } from "node:crypto";
import { JwtPayload } from "./jwt.strategy.js";
import { randomUUID } from 'node:crypto';

interface IUser {
  id: string
  email: string
}
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private generateTokens(user: IUser) {
    const payload = { sub: user.id, username: user.email, jti: randomUUID() }
    const expiresIn =  this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as JwtSignOptions['expiresIn']
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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true }
    })
    if(!user) {
      throw new UnauthorizedException()
    }

    const isPasswordOk = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordOk) {
      throw new UnauthorizedException()
    }
    // eslint-disable-next-line no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password)
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

  async refresh(refreshToken: string) {
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.')
    }

    const tokenInfo = await this.prisma.refreshToken.findUnique({
      where: { userId: payload.sub }
    })

    const refreshHashCurrent = createHash('sha256').update(refreshToken).digest('hex')
    if(refreshHashCurrent !== tokenInfo?.refreshHash) {
      throw new UnauthorizedException('Invalid refresh token.')
    }

    if (!tokenInfo || tokenInfo?.revokedAt) {
      throw new UnauthorizedException('Token is revoked.')
    }

    const { refreshToken: refreshTokenNew, accessToken, expiresAt, refreshHash } = this.generateTokens({id: payload.sub, email: payload.username})

    await this.prisma.refreshToken.update({
      where: { userId: payload.sub },
      data: {
        refreshHash,
        expiresAt
      }
    })

    return {
      accessToken,
      refreshToken: refreshTokenNew
    }
  }
}