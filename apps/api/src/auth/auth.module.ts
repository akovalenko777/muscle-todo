import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy.js";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})

export class AuthModule {}