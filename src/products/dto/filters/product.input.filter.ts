import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsPositive } from 'class-validator';


@InputType()
export class ProductFiltersInput {

    @Field(() => String, { nullable: true })
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

    @Field(() => Boolean, { nullable: true })
    @IsPositive()
    @IsOptional()
    isAvailable?: boolean;
}
