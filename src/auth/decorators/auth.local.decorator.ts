import { applyDecorators, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.guard';

export function AuthLocal() {
    return applyDecorators(UseGuards(LocalAuthGuard));
}