import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { ValidatorModule } from 'src/helpers/service/validator.module';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';
import { CloudinaryModule } from 'src/helpers/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/helpers/cloudinary/cloudinary.service';
import { ProductsResolver } from './products.resolver';
import { ConfigurationModule } from 'src/helpers/configuration/configuration.module';

@Module({
  imports: [
    PrismaModule,
    ValidatorModule,
    ConfigurationModule,
    CloudinaryModule],
  providers: [
    ProductsService,
    ProductsResolver,],
  controllers: [ProductsController],
  exports: [ProductsService]
})
export class ProductsModule { }
