import { Field, Int, ObjectType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@ObjectType()
export class CreateCategoryRes {
  @Field(() => Int!)
  id: number;

  @Field(() => String!)
  @IsString()
  name: string;

  @Field(() => Date!)
  createdAt: Date;
}
