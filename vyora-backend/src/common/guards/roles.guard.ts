import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@vyora/shared-types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user, businessRole } = context.switchToHttp().getRequest();
    const effectiveRole = businessRole || user?.role;

    if (!effectiveRole || !requiredRoles.includes(effectiveRole)) {
      throw new ForbiddenException(
        'Only business owners have permission to add, edit, or delete records. Staff accounts have view-only access.',
      );
    }

    return true;
  }
}
