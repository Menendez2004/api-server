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
import { ProductsResolver } from './products/products.resolver';
import { OrdersResolver } from './orders/orders.resolver';
import { PaymentsResolver } from './payments/payments.resolver';
import { FavoritesResolver } from './favorites/favorites.resolver';
import { CartsResolver } from './carts/carts.resolver';
import { CategoriesResolver } from './categories/categories.resolver';
import { CategoriesModule } from './categories/categories.module';
import { CartsModule } from './carts/carts.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';

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
  ],
  controllers: [UsersController,AuthController],
  providers: [PrismaService,{
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter
  }, ProductsResolver, OrdersResolver, PaymentsResolver, FavoritesResolver, CartsResolver, CategoriesResolver
  ],
})
export class AppModule { }
