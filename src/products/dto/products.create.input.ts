import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Int)
  @IsNotEmpty()
  price: number;

  @Field(() => [Int])
  @IsDefined()
  categoryId: number[];

  @Field(() => Int)
  @IsNotEmpty()
  stock: number;

  @Field(() => Boolean)
  @IsDefined()
  isAvailable: boolean;
}
