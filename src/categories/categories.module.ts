import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CategoriesResolver } from './categories.resolver';
import { ValidatorModule } from '../common/service/validator.module';
import { ConfigurationModule } from '../common/configuration/configuration.module';

@Module({
  imports: [PrismaModule, ValidatorModule, ConfigurationModule],
  providers: [CategoriesService, CategoriesResolver],
  exports: [CategoriesService],
})
export class CategoriesModule {}
