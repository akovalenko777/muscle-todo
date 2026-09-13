import { Controller, Get, Post, Patch, Param, Body, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService){}

  @Get()
  findAll(){
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string){
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateUserDto){
    return this.usersService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto){
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string){
    return this.usersService.remove(id)
  }
}
