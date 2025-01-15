import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsPositive } from 'class-validator';

@InputType()
export class CategoryPaginationFilter {
    @Field(() => Number, { nullable: true })
    @IsOptional()
    @IsPositive()
    categoryId?: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    name?: string;

}
