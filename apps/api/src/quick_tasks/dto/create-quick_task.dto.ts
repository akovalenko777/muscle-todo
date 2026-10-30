import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuickTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsBoolean()
  @IsOptional()
  done: boolean
}