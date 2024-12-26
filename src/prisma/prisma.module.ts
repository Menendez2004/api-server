import {Module} from '@nestjs/common';
import {PrismaService} from './prisma.service';
import { AuthService } from './auth/auth.service';
@Module({
    providers: [PrismaService, AuthService],
    exports: [PrismaService],
})
export class PrismaModule {}