import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@ObjectType()
export class RemoveCategoryRes {
  @Field(() => Int)
  @IsNumber()
  id: number;
}
