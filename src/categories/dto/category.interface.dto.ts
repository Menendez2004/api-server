import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

}
