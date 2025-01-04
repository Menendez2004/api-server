import { createUnionType } from '@nestjs/graphql';
import { AddFavoriteRes } from './add.favorite.product.res';
import { RemoveFavoriteRes } from './remove.favorite.product.res';

/**
 * A GraphQL union type for Favorite actions.
 * Combines `AddFavoriteRes` and `RemoveFavoriteRes` for flexible responses.
 */
export const FavoriteResponse = createUnionType({
  name: 'FavoriteResponse',
  description:
    'Represents the result of a favorite product action, either adding or removing a favorite.',
  types: () => [AddFavoriteRes, RemoveFavoriteRes] as const,
  resolveType(value) {
    return 'deletedAt' in value ? RemoveFavoriteRes : AddFavoriteRes;
  },
});
