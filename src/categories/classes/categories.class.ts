import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class categories {
  @Field(() => ID)
  id: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ name: 'createdAt' })
  createdAt: Date;
  @Field({ name: 'updatedAt' })
  updatedAt: Date;
}
