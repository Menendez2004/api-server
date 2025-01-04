import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class CategoriesClass {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
