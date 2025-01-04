import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

@InputType()
export class GetOrderArg {
  @Field(() => ID!)
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  orderId: string;
}
