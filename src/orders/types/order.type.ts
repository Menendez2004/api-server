import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OrderDetailType } from './index.types';
import { User } from '../../users/model/index.model';
import { PaymentDetailType } from '../../payments/types/index.type';

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

  @Field(() => User)
  user?: User | null;

  @Field(() => [OrderDetailType!])
  orderDetails: OrderDetailType[];

  @Field(() => PaymentDetailType, )
  paymentDetail?: PaymentDetailType | null;
}
