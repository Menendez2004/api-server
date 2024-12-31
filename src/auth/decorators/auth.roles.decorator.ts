import { SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/token.guard';
import { RolesGuard } from '../guards/usersRole.guard';

export function Auth(...roles: RoleName[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(JwtAuthGuard, RolesGuard),
    );
}