import { Field, ID, InputType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class NewOrderArg {
  @Field(() => ID!)
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

}
