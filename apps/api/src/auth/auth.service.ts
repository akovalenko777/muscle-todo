import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { createHash } from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true }
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
    const payload = { sub: user.id, username: user.email }

    const expiresIn =  this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as JwtSignOptions['expiresIn']

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn
    })

    const refreshHash = createHash('sha256').update(refresh_token).digest('hex')
    const expiresAt = new Date(new Date().getTime() + ms(expiresIn as ms.StringValue))

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
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') as JwtSignOptions['expiresIn']
      }),
      refresh_token
    }
  }

  async refresh(){
  
  }
}