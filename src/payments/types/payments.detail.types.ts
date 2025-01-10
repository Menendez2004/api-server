import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PaymentStatusType } from './payments.status.types';

@ObjectType()
export class PaymentDetailType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  payment_intent_id: string;

  @Field(() => String)
  payment_method_id: string;

  @Field(() => String)
  order_id: string;

  @Field()
  amount: number;

  @Field(() => PaymentStatusType)
  status: PaymentStatusType;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field()
  payment_date: Date;
}
