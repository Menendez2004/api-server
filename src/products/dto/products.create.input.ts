import { InputType, Field, Int} from '@nestjs/graphql';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateProductInput {
    @Field( () => String)
    @IsNotEmpty()
    @IsString()
    name: string;

    @Field( () => String)
    @IsNotEmpty()
    @IsString()
    description: string;

    @Field( () => Int)
    @IsNotEmpty()
    price: number;

    @Field( () => [Int])
    @IsUUID()
    categoryId: number[];

    @Field( () => Int)
    @IsNotEmpty()
    stock: number;
    

    @Field(() => Boolean, { defaultValue: true })
    isAvailable: boolean;

}
