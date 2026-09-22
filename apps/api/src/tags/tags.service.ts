import { BadRequestException, Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma } from "../generated/prisma/client.js";
import { CreateTagDto } from "./dto/create-tag.dto.js";
import { UpdateTagDto } from "./dto/update-tag.dto.js";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.tag.findMany({ orderBy: { text: 'asc' } })
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } })
    if (!tag) {
      throw new NotFoundException(`Tag with id: ${id} not found`)
    }
    return tag
  }

  async create(dto: CreateTagDto) {
    try {
      return await this.prisma.tag.create({ data: { ...dto } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Tag with text "${dto.text}" already exists`)
      }
      throw error
    }
  }

  async update(id: string, dto: UpdateTagDto) {
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: { ...dto }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Tag with ${id} not found for update`)
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.tag.delete({ where: { id } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Tag with ${id} not found for delete`)
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Cannot delete a tag that is still assigned to tasks')
        }
      }
      throw error
    }
  }
}