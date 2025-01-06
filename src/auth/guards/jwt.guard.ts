import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { HandleContext } from '../../helpers/filters/context.helper.filter';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext): Promise<any> {
        return HandleContext(context);
    }
    
    handleRequest(err: any, user: any, info: string): string | any {
        if (err || !user) {
            console.log( UnauthorizedException, err || info  );
            throw err || new UnauthorizedException('Unauthorized');
        }
        return user;
    }
}
