import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
  imports: [PrismaModule, ConfigurationModule],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
