import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enum';
import { ROLES_KEY } from '../../decorators';

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
