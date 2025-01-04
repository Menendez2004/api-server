import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Expose, Type } from 'class-transformer';
import { ProductsTypes } from '../../products/types/index.types';

@ObjectType()
export class OrderDetailType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  order_id: string;

  @Field(() => String)
  product_id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  unit_price: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => ProductsTypes)
  @Type(() => ProductsTypes)
  @Expose()
  product: ProductsTypes;
}
