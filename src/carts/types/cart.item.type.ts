import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProductsTypes } from '../../products/types/products.types';
import { Expose } from 'class-transformer';

@ObjectType()
export class CartItemType {
    @Field(() => ID)
    id: string;

    @Field(() => ProductsTypes)
    product: ProductsTypes;

    @Field()
    quantity: number;

    @Field(() => Date, )
    @Expose()
    createdAt: Date;

    @Field(() => Date)
    @Expose()
    updatedAt: Date;
}
