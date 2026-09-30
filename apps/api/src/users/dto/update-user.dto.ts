import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto.js";
import { IsEnum, IsOptional } from "class-validator";
import { UserRole } from "../../generated/prisma/enums.js";

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}