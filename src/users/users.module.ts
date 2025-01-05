import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    PrismaModule,
    TokenModule,
  ],
  providers: [UsersService,],
  exports: [UsersService]
})
export class UsersModule { }
