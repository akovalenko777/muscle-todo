import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { createHash } from "node:crypto";
import { JwtPayload } from "./jwt.strategy.js";
import { randomUUID } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';

export type TRole = 'USER' | 'ADMIN'
export interface IUser {
  id: string
  email: string
  role: TRole
}
@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'))
  }

  private generateTokens(user: IUser) {
    const payload = { sub: user.id, username: user.email, jti: randomUUID(), role: user.role }
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

  private async upsertRefreshToken(user: IUser) {
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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, googleId: true, role: true }
    })
    if(!user) {
      throw new UnauthorizedException()
    }

    if(!user.passwordHash){
      throw new UnauthorizedException('This account uses Google sign-in. Please log in with Google.')
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
    return await this.upsertRefreshToken(user)
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

    const { refreshToken: refreshTokenNew, accessToken, expiresAt, refreshHash } = this.generateTokens({id: payload.sub, email: payload.username, role: payload.role })

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

  async loginWithGoogle(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID')
    })

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException("Invalid Google token")
    }

    let user = await this.prisma.user.findFirst({
      where: { googleId: payload.sub } as any,
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      //NOTE: try to find user by email
      const existRegularUser = await this.prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true, email: true, googleId: true }
      })

      if (existRegularUser) {
        throw new UnauthorizedException('Use regular email/password for login.')
      }

      //NOTE: create new user
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          googleId: payload.sub,
          name: payload.name || ''
        },
        select: { id: true, email: true, role: true }
      })
    }

    return await this.upsertRefreshToken(user)
  }
}