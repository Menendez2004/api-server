import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class CategoriesClass {
    @Field(() => ID)
    id: number;

    @Field({ name: 'name' })
    name: string;

    @Field({ name: 'createdAt' })
    created_at: Date;

    @Field({ name: 'updatedAt' })
    updated_at: Date;
}
