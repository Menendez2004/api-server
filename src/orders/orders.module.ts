import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ProductsModule } from 'src/products/products.module';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { CartsModule } from 'src/carts/carts.module';
import { UsersModule } from 'src/users/users.module';
import { OrdersResolver } from './orders.resolver';

@Module({
  imports: [
    ProductsModule,
    PrismaModule,
    CartsModule,
    UsersModule
  ],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService]
})
export class OrdersModule {}
