import { InputType, Field, Int } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class UpsertCartItemInput {
  @Field(() => String!)
  @Expose()
  @IsString()
  @IsUUID('4' )
  productId: string;

  @Field(() => String!)
  @Expose()
  @IsString()
  @IsUUID('4')
  @IsOptional()
  cartId?: string;

  @Field(() => Int!)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(0, { message: 'Quantity must be greater or equal than 0' })
  quantity: number;
}
