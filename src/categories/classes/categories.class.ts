import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class CategoriesClass {
    @Field(() => ID)
    id: number;

    @Field()
    @IsNotEmpty()
    @IsString()
    name: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
