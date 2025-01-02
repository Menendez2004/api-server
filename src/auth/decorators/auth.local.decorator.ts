import { applyDecorators, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/auth.local.guard';

export function AuthLocal() {
    return applyDecorators(UseGuards(LocalAuthGuard));
}