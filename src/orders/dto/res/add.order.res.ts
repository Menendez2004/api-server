import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NewRecordInfo } from '../../../helpers/interfaces/index.interface';
import { Expose } from 'class-transformer';

@ObjectType({
  implements: () => [NewRecordInfo],
})
export class NewOrderRecordRes implements NewRecordInfo {
  @Field(() => ID!)
  id: string;

  @Field(() => Date!)
  @Expose()
  createdAt: Date;
}
