import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class UpdateProductArg {
  @Field(() => String)
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;
}
