import { InputType, Field, ID } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpserFavoriteArgs {
  @Field(() => ID!)
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', )
  productId: string;
}
