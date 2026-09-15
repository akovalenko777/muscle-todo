import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthDto } from "./dto/auth.dto.js";
import { Public } from "./decorators/public.decorator.js";
import { RefreshDto } from "./dto/refresh.dto.js";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() { email, password }: AuthDto){
    return this.authService.login(email, password)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() { refreshToken }: RefreshDto){
    return this.authService.refresh(refreshToken)
  }
}