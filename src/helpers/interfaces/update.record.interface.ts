import { Field, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class RecordUpdate {
  @Field(() => Date!)
  updatedAt: Date;
}
