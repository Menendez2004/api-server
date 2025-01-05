import { Resolver, Context, Mutation, Query, Args } from '@nestjs/graphql';
import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { GlobalExceptionFilter } from 'src/helpers/filters/global.exception.filter';
import { AuthRole } from 'src/auth/decorators/auth.roles.decorator';
import { UpserFavoriteArgs } from './dto/arg/upser.favorite.arg';
import { FavoriteResponse } from './dto/res/index.favorites.res';
import { UserGraphInterface } from './interface/user.gql.interface';
import { FavoriteType } from './types/favorite.product.type';



@Resolver()
@UseFilters(new GlobalExceptionFilter)
export class FavoritesResolver {
    private readonly logger = new Logger(FavoritesResolver.name);

    constructor(private readonly favoritesService: FavoritesService) { }
    @AuthRole('CLIENT')
    @Mutation(() => FavoriteResponse, {
        name: 'upsertFavorite',
        description: 'Toggle the favorite status of a product for the authenticated user',
    })
    async upsertFavorite(
        @Context() Context: UserGraphInterface,
        @Args('input') input: UpserFavoriteArgs
    ): Promise<typeof FavoriteResponse> {
        const userId = Context.user.id;
        const { productId } = input;
        this.logger.log(`upsertFavorite: userId ${userId} productId ${productId}`);

        return this.favoritesService.toggleFavoriteStatus(userId, productId);
    }

    @AuthRole('CLIENT')
    @Query(()=> [FavoriteType])
    async getFavorites(
        @Context() Context: UserGraphInterface
    ): Promise<FavoriteType[]> {
        const userId = Context.user.id;
        this.logger.log(`getFavorites: userId ${userId}`);
        return this.favoritesService.getUserFavorites(userId);
    }



}
