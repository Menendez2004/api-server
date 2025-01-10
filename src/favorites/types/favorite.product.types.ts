import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ProductsTypes } from '../../products/types/index.types';

@ObjectType()
export class FavoriteType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  productId: string;

  @Field(() => ProductsTypes)
  product: ProductsTypes;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
