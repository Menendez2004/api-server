import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OrderDetailType } from './index.types';
import { UserClass } from '../../users/classes/index.clases';
import { PaymentDetailType } from '../../payments/types/index.types';

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  address: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => UserClass)
  user?: UserClass | null;

  @Field(() => [OrderDetailType!])
  orderDetails: OrderDetailType[];

  @Field(() => PaymentDetailType)
  paymentDetail?: PaymentDetailType | null;
}
