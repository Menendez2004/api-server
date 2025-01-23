import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { CategoriesResolver } from './categories.resolver';
import { ValidatorModule } from '../helpers/service/validator.module';
import { ConfigurationModule } from 'src/helpers/configuration/configuration.module';

@Module({
  imports: [PrismaModule, ValidatorModule, ConfigurationModule],
  providers: [CategoriesService, CategoriesResolver],
  exports: [CategoriesService],
})
export class CategoriesModule {}
