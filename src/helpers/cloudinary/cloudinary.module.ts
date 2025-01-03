import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigurationService } from '../configuration/configuration.service';

@Module({
  providers: [CloudinaryProvider, ConfigurationService],
  imports: [PrismaModule],
  exports: [CloudinaryProvider],
})
export class CloudinaryModule {}
