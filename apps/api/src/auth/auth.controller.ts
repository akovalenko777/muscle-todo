import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthDto } from "./dto/auth.dto.js";
import { Public } from "./decorators/public.decorator.js";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Public()
  @Post('login')
  login(@Body() { email, password }: AuthDto){
    return this.authService.login(email, password)
  }

}