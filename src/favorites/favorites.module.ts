import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { FavoritesResolver } from './favorites.resolver';

@Module({
  imports: [PrismaModule],
  providers: [FavoritesService, FavoritesResolver],
  exports: [FavoritesService, FavoritesResolver],
})
export class FavoritesModule {}
