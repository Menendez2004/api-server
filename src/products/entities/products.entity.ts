
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { CategoryObject } from '../../categories/dto/entity/category.entity';

@ObjectType()
export class ProductObject {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;


    @Field(() => String, { nullable: true })
    url?: string;

    @Field(() => ID)
    categoryId: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field()
    isEnabled: boolean;

    @Field()
    isDeleted: boolean;

    @Field()
    likesCount: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;

    @Field(() => CategoryObject)
    category: CategoryObject;
}
