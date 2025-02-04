import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ValidatorModule } from '../common/service/validator.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { ProductsResolver } from './products.resolver';
import { ConfigurationModule } from '../common/configuration/configuration.module';

@Module({
  imports: [
    PrismaModule,
    ValidatorModule,
    ConfigurationModule,
    CloudinaryModule,
  ],
  providers: [ProductsService, ProductsResolver],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
