import { Controller, Get, Post, Patch, Param, Body, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto, UpdateUserPasswordDto } from "./dto/update-user.dto.js";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from "../auth/decorators/public.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService){}

  @Get()
  @Roles('ADMIN')
  findAll(){
    return this.usersService.findAll()
  }

  @Get('me')
  getMe(@CurrentUser() user: { userId: string; email: string }){
    return this.usersService.findOne(user.userId)
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string){
    return this.usersService.findOne(id)
  }

  @Post()
  @Public()
  create(@Body() dto: CreateUserDto){
    return this.usersService.create(dto)
  }

  @Patch('me')
  updateMe(@CurrentUser() user: { userId: string }, @Body() dto: UpdateUserDto){
    return this.usersService.update(user.userId, dto)
  }

  @Patch('me/password')
  updatePassword(@CurrentUser() user: { userId: string }, @Body() dto: UpdateUserPasswordDto){
    return this.usersService.updatePassword(user.userId, dto)
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateUserDto){
    return this.usersService.updateByAdmin(id, dto, user.userId)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string){
    return this.usersService.remove(id)
  }
}
