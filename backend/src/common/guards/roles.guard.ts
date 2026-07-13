import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../../generated/prisma/enums.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { Request } from 'express';

interface UserWithRole {
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserWithRole }>();
    return requiredRoles.includes(request.user.role as Role);
  }
}
