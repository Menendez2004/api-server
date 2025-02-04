import { Resolver, Context, Mutation, Query, Args } from '@nestjs/graphql';
import { Logger, UseFilters } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { GlobalExceptionFilter } from '../common/filters/global.exception.filter';
import { AuthRole } from 'src/auth/decorators/auth.roles.decorator';
import { UpserFavoriteArgs } from './dto/arg/upser.favorite.args';
import { FavoriteResponse } from './dto/res/index.favorites.res';
import { FavoriteType } from './types/favorite.product.types';

@Resolver()
@UseFilters(new GlobalExceptionFilter())
export class FavoritesResolver {
  private readonly logger = new Logger(FavoritesResolver.name);

  constructor(private readonly favoritesService: FavoritesService) {}
  @AuthRole('CLIENT')
  @Mutation(() => FavoriteResponse, {
    name: 'upsertFavorite',
    description:
      'Toggle the favorite status of a product for the authenticated user',
  })
  async upsertFavorite(
    @Context('req') { user }: { user: { id: string } },
    @Args('input') input: UpserFavoriteArgs,
  ): Promise<typeof FavoriteResponse> {
    return this.favoritesService.toggleFavoriteStatus(user.id, input.productId);
  }

  @AuthRole('CLIENT')
  @Query(() => [FavoriteType])
  async getFavorites(
    @Context('req') { user }: { user: { id: string } },
  ): Promise<FavoriteType[]> {
    return this.favoritesService.getUserFavorites(user.id);
  }
}
