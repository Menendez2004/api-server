
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

export function extractRequestFromContext(context: ExecutionContext): any {
    
    const   reqContextType = context.getType<string>();
    switch (reqContextType) {
        case 'http':
            return context.switchToHttp().getRequest();

        default:
            throw new UnauthorizedException(
                'Unsupported request context type: ' + reqContextType, 
            );
    }
}