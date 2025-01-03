import { Field, ObjectType, ID } from '@nestjs/graphql';
import { CategoriesClass } from 'src/categories/classes/categories.class';
import { ImagesTypes } from './images.type';
import { Type } from 'class-transformer';

@ObjectType()
export class ProductsTypes {
    @Field(() => ID)
    id: string;

    @Field()
    product_name: string;

    @Field()
    description: string;

    @Field()
    stock: number;

    @Field()
    is_available: boolean;

    @Field()
    unit_price: number;

    @Field(() => [CategoriesClass])
    @Type(() => CategoriesClass)
    categories: CategoriesClass[];

    @Field(() => [ImagesTypes])
    images: ImagesTypes[];

    @Field()
    created_at: Date;

    @Field()
    updated_at: Date;
}
