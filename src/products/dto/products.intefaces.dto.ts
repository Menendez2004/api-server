import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field()
  description: string;

  @Field()
  stock: number;

  @Field()
  isAvailable: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
