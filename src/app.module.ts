import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users/users.controller';
import { PrismaModule } from './helpers/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { GlobalExceptionFilter } from 'src/helpers/filters/global.exception.filter';
import { CategoriesModule } from './categories/categories.module';
import { CartsModule } from './carts/carts.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { ValidatorModule } from './helpers/service/validator.module';
import { GraphqlModule } from './graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
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
    ProductsModule
  ],
  controllers: [UsersController,AuthController],
  providers: [
    PrismaService,
    {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter
  }, 
  ],
})
export class AppModule { }
