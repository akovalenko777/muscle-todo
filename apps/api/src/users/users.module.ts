import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { TokensService } from "../tokens/token.service.js";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [UsersController],
  providers: [UsersService, TokensService, JwtService]
})

export class UsersModule {}