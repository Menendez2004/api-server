import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
