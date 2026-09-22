import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TRole } from "./auth.service.js";

export interface JwtPayload {
  sub: string;
  username: string;
  role: TRole;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET')
    })
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.username, role: payload.role }
  }
}