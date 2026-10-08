import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { Prisma } from "../generated/prisma/client.js";
import { UpdateUserDto, UpdateUserPasswordDto } from "./dto/update-user.dto.js";
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { TokensService } from "../tokens/token.service.js";
import { FAKE_HASH } from "../tasks/helper/constants.js";

const omit = { passwordHash: true }

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService
  ) { }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      omit
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit
    })
    if (!user) {
      throw new NotFoundException(`User with ${id} is not found`)
    }
    return user
  }

  async create(dto: CreateUserDto) {
    const { password, ...data } = dto
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL')
    const role = data.email === adminEmail ? 'ADMIN' : 'USER'
    try {
      const passwordHash = await bcrypt.hash(password, 10)
      return await this.prisma.user.create({
        data: { passwordHash, ...data, role },
        omit
      })

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException("User with this email already exists")
      }
      throw error
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    const { role: _role, ...data } = dto
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { ...data },
        omit
      })

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ${id} not found for update`)
      }
      throw error
    }
  }

  async updatePassword(id: string, dto: UpdateUserPasswordDto) {
    const { currentPassword, password } = dto
    // check current password
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, passwordHash: true, email: true, role: true }
    })
    if(!user) {
      throw new BadRequestException('Invalid user ID')
    }

    if(!user.passwordHash){
      // NOTE: call bcrypt with fake value for same time to answer
      await bcrypt.compare('fakeCurrentPassword', FAKE_HASH)
      throw new BadRequestException('Invalid current password')
    }

    const isPasswordOk = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!isPasswordOk) {
      throw new BadRequestException('Invalid current password')
    }
    // set new password hash
    const passwordHash = await bcrypt.hash(password, 10)
    try {
      await this.prisma.user.update({
        where: { id },
        data: { passwordHash },
        omit
      })
      // generate and return new tokens
      return await this.tokensService.upsertRefreshToken(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ${id} not found for update`)
      }
      throw error
    }
  }

  async updateByAdmin(id: string, dto: UpdateUserDto, userId: string) {
    const { role, ...data } = dto
    if (id === userId && role !== undefined) {
      throw new BadRequestException('You cannot change your own role')
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { ...data, role },
        omit
      })

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ${id} not found for update`)
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ${id} not found for delete`)
      }
      throw error
    }
  }

}