import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OrderDetailType } from './index.types';
import { UserClass } from 'src/users/classes/user.classes';
import { PaymentDetailType } from '../../payments/types/index.type';

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  user_id: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  nearby_landmark: string;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date)
  updated_at: Date;

  @Field(() => UserClass)
  user?: UserClass | null;

  @Field(() => [OrderDetailType!])
  orderDetails: OrderDetailType[];

  @Field(() => PaymentDetailType, )
  paymentDetail?: PaymentDetailType | null;
}
