import { InputType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class RemoveProductFromCartArgs {
  @Field(() => String!)
  @Expose()
  @IsString()
  @IsUUID('4')
  productId: string;

  @Field(() => String!)
  @Expose()
  @IsString()
  @IsUUID('4')
  cartId: string;
}
