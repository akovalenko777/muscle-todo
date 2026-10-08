import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { PASSWORD_REQ } from '../../tasks/helper/constants.js';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(PASSWORD_REQ)
  @IsOptional()
  password: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  googleId?: string;

}