import { SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';

export function AuthRole(...roles: RoleName[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(JwtAuthGuard, RolesGuard),
    );
}