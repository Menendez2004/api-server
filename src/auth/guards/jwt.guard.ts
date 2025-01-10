import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HandleContext } from '../../helpers/filters/context.helper.filter';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  getRequest(context: ExecutionContext): Promise<any> {
    return HandleContext(context);
  }

  handleRequest(err: any, user: any, info: string): any {
    if (err || !user) {
      this.logger.error('Unauthorized access attempt', err || info);
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
