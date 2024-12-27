import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractRequestFromContext } from '../../helpers/context.helper';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    /**
     * Determines whether a request can proceed based on the required roles.
     * @param context Execution context provided by the framework.
     * @returns `true` if the user has the required role(s), otherwise throws an exception.
     */

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles ) return true; // No roles required, allow access

        // Extract the request and user information from the context
        const request = extractRequestFromContext(context);
        if (!request) {
            throw new UnauthorizedException('Unable to extract request from context');
        }

        const user = request.user;
        if (!user || !user.role) {
            throw new UnauthorizedException('User not authenticated or role information is missing');
        }

        // this is helpful for the statuses code 403
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException(
                `User role '${user.role}' does not have access to this resource`,
            );
        }

        return true;
    }
}
