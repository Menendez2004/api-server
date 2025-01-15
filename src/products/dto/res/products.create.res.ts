import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@ObjectType()
export class CreateProductsRes {
  @Field(() => ID!)
  @IsUUID()
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  createdAt: Date;
}
