import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Expose, Type } from 'class-transformer';
import { ProductsTypes } from '../../products/types/index.types';

@ObjectType()
export class OrderDetailType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ProductsTypes)
  @Type(() => ProductsTypes)
  @Expose()
  product: ProductsTypes;
}
