import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users/users.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { PrismaService } from './common/prisma/prisma.service';
import { GlobalExceptionFilter } from './common/filters/global.exception.filter';
import { CategoriesModule } from './categories/categories.module';
import { CartsModule } from './carts/carts.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { ValidatorModule } from './common/service/validator.module';
import { GraphqlModule } from './graphql.module';
import { TokenModule } from './token/token.module';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from './common/mail/mail.module';
import { ConfigurationModule } from './common/configuration/configuration.module';
import { ValidatorService } from './common/service/validator.service';

@Module({
  controllers: [UsersController, AuthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    ConfigurationModule,
    AuthModule,
    PrismaModule,
    CategoriesModule,
    CartsModule,
    FavoritesModule,
    PaymentsModule,
    OrdersModule,
    ProductsModule,
    ValidatorModule,
    GraphqlModule,
    ProductsModule,
    TokenModule,
    MailModule,
    ThrottlerModule.forRoot([
      {
        ttl: seconds(parseInt(process.env.THROTTLE_TTL)),
        limit: parseInt(process.env.THROTTLE_LIMIT),
      },
    ]),
  ],
  providers: [
    PrismaService,
    ValidatorService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
