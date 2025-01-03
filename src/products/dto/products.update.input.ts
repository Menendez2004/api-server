import { IsArray, IsEnum, IsInt, IsString, IsUUID } from 'class-validator';
import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './products.create.input';
import { OperationType } from 'src/helpers/enums/operation.type.enum';


@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
    @Field()
    @IsString()
    @IsUUID()
    id: string;

    @IsEnum(OperationType)
    operation: OperationType;

    @Field( () => [Int!]!)
    @IsArray()
    @IsInt()
    categories: number[];
}
