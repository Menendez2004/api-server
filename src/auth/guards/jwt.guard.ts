import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { HandleContext } from 'src/helpers/filters/context.helper.filter';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext): Promise<any> {
        return HandleContext(context);
    }
    
    handleRequest(err: any, user: any, info: string): string | any {
        if (err || !user) {
            console.error('Authentication error:', err || info );
            console.log('user token:', user.token);
            throw err || new UnauthorizedException('Unauthorized');
        }
        return user;
    }
}
