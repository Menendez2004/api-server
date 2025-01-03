import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function HandleContext(context: ExecutionContext): any {
    const contextType = context.getType<string>();

    switch (contextType) {
        case 'http':
            return context.switchToHttp().getRequest();
        case 'graphql':
            const gqlContext = GqlExecutionContext.create(context);
            return gqlContext.getContext().request;
        default:
            throw new UnauthorizedException(
                `Unsupported context type: ${contextType}`,
            );
    }
}
