import { Field, ObjectType, ID } from '@nestjs/graphql';
import { CategoriesClass } from '../../categories/classes/categories.class';
import { ImagesTypes } from './images.type';

@ObjectType()
export class ProductsTypes {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  stock: number;

  @Field()
  isAvailable: boolean;

  @Field()
  price: number;

  @Field(() => [CategoriesClass])
  categories: CategoriesClass[];

  @Field(() => [ImagesTypes])
  images: ImagesTypes[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
