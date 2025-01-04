import { Field, ObjectType, ID } from '@nestjs/graphql';
import { CartItemType } from './cart.item.type';

@ObjectType()
export class CartType {
    @Field(() => ID)
    id: string;

    @Field(() => [CartItemType!]!)
    cartItems: CartItemType[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
