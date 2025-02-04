import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { ValidatorService } from '../common/service/validator.service';
import { ProductsModule } from 'src/products/products.module';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CartsResolver } from './carts.resolver';

@Module({
  imports: [ProductsModule, PrismaModule],
  providers: [CartsService, ValidatorService, CartsResolver],
  exports: [CartsService],
})
export class CartsModule {}
