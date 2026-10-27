import { IsNumberString, IsOptional, IsString } from "class-validator"

export class ArchiveTaskDto {
  @IsNumberString()
  @IsOptional()
  page?: string

  @IsNumberString()
  @IsOptional()
  pageSize?: string

  @IsString()
  @IsOptional()
  search?: string

  @IsString()
  @IsOptional()
  tags?: string

  @IsString()
  @IsOptional()
  assigneeId?: string
}