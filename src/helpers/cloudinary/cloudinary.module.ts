import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [CloudinaryProvider],
  imports: [PrismaModule],
  exports: [CloudinaryProvider],
})
export class CloudinaryModule {}
