import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, { message: 'color must be a valid hex color' })
  color!: string;
}