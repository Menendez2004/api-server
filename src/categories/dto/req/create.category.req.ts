import { InputType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCategoryReq {
  @Field(() => String!)
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;
}
