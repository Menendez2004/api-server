import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { ValidatorService } from 'src/helpers/service/validator.service';
import { ProductsModule } from 'src/products/products.module';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { CartsResolver } from './carts.resolver';

@Module({
  imports: [
    ProductsModule, 
    PrismaModule
  ],
  providers: [
    CartsService,
    ValidatorService,
    CartsResolver
  ],
  exports: [CartsService]
})
export class CartsModule {}
