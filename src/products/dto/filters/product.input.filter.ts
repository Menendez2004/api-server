import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsPositive } from 'class-validator';


@InputType()
export class ProductFiltersInput {

    @Field(() => String, { nullable: true })
    @IsUUID()
    @IsOptional()
    name?: string;

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    price?: string;

    @Field(() => Number, { nullable: true })
    @IsPositive()
    @IsOptional()
    categoryId?: number;

    @Field(() => Number, { nullable: true })
    @IsPositive()
    @IsOptional()
    isAvailable?: number;
}
