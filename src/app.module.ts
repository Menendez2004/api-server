import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users/users.controller';
import { PrismaModule } from './helpers/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { PrismaService } from './prisma.service';
import { globalFilterException } from './helpers/globalFilterException';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [UsersController,AuthController],
  providers: [PrismaService,{
    provide: APP_FILTER,
    useClass: globalFilterException
  }
  ],
})
export class AppModule { }
