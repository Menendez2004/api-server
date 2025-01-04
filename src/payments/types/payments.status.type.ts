import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentStatusType {
    @Field(() => ID)
    id: number;

    @Field()
    status: string;

    @Field({ name: 'createdAt' })
    createdAt: Date;

    @Field({ name: 'updatedAt' })
    updatedAt: Date;
}
