import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ThrottlerContextGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: any; res: any } {
    const contextType = context.getType<string>();

    if (contextType === 'http') {
      const httpContext = context.switchToHttp();
      return {
        req: httpContext.getRequest(),
        res: httpContext.getResponse(),
      };
    }

    if (contextType === 'graphql') {
      const graphqlContext = GqlExecutionContext.create(context);
      const ctx = graphqlContext.getContext<{
        request: any;
        response: any;
      }>();
      return { req: ctx.request, res: ctx.response };
    }

    throw new UnauthorizedException(`Unsupported context type: ${contextType}`);
  }
}
