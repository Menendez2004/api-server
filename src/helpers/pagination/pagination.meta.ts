import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaginationMeta {
    @Field(() => Int)
    totalItems: number;

    @Field(() => Int)
    totalPages: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    page: number;
}
