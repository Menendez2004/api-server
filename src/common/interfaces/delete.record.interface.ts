import { Field, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class RecordDeletion {
  @Field(() => Date!)
  deletedAt: Date;
}
