import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserRoles } from './user.role.classes';

@ObjectType()
export class UserClass {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;


  @Field()
  roleId: number;

  @Field()
  address: string;

  @Field()
  password: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => UserRoles)
  role: UserRoles;
}
