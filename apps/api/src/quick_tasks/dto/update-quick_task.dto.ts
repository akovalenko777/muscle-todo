import { PartialType } from "@nestjs/mapped-types";
import { CreateQuickTaskDto } from "./create-quick_task.dto.js";

export class UpdateQuickTaskDto extends PartialType(CreateQuickTaskDto) {}