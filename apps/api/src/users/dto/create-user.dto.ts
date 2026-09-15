import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  // NOTE: lite password requirements just for testing
  // TODO: for production set to default
  @IsStrongPassword({
    minLength: 3,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0
  })
  password!: string

}