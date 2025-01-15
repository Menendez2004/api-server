import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@InterfaceType()
export abstract class NewRecordInfo {
  @Field(() => ID!)
  id: string;

  @Field(() => Date!)
  @Expose()
  createdAt: Date;
}
