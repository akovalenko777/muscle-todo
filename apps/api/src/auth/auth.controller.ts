import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthDto } from "./dto/auth.dto.js";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Post('login')
  login(@Body() { email, password }: AuthDto){
    return this.authService.login(email, password)
  }

}