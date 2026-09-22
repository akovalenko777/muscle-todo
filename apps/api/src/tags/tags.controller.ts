import { Controller, Get, Body, Param, Post, Patch, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { TagsService } from "./tags.service.js";
import { CreateTagDto } from "./dto/create-tag.dto.js";
import { UpdateTagDto } from "./dto/update-tag.dto.js";
import { Roles } from "../auth/decorators/roles.decorator.js";

@ApiTags('tags')
@ApiBearerAuth()
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService){}

  @Get()
  findAll(){
    return this.tagsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string){
    return this.tagsService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateTagDto){
    return this.tagsService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTagDto){
    return this.tagsService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  remove(@Param('id') id: string){
    return this.tagsService.remove(id)
  }
}