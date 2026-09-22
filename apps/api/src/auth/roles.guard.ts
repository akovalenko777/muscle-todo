import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./decorators/roles.decorator.js";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RoleGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector){
    super()
  }

  canActivate(context: ExecutionContext) {
    const accessRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if(!accessRoles){
      return true
    }

    const request = context.switchToHttp().getRequest()
    return accessRoles.includes(request.user?.role)
  }
}