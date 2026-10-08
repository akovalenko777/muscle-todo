import { OmitType, PartialType, PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto.js";
import { IsEnum, IsOptional, IsString, IsNotEmpty, IsStrongPassword } from "class-validator";
import { UserRole } from "../../generated/prisma/enums.js";
import { PASSWORD_REQ } from "../../tasks/helper/constants.js";

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

export class UpdateUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(PASSWORD_REQ)
  password!: string
}