import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ProductObject } from 'src/products/entities/products.entity';

@ObjectType()
export class CategoryObject {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field(() => [ProductObject])
    products: ProductObject[];
}
