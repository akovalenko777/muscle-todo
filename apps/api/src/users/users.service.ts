import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { Prisma } from "../generated/prisma/client.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

const omit = { passwordHash: true }

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) { }

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
    const { ...data } = dto
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