import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private readonly reflecotr: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflecotr.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const user = context.switchToHttp().getRequest().user;
    const hasRequiredRole = requiredRoles.some(role => user.role === role);

    return hasRequiredRole;
  }
}
