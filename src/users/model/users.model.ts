import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserRoles } from './user.roles.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  email: string;

  @Field()
  is_email_verified: boolean;

  @Field()
  role_id: number;

  @Field()
  address: string;

  @Field()
  password: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => UserRoles)
  role: UserRoles;
}
