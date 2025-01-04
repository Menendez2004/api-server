import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NewRecordInfo } from 'src/helpers/interfaces/index.interface';
import { Expose } from 'class-transformer';

@ObjectType({
  implements: () => [NewRecordInfo],
})
export class NewOrderRecord implements NewRecordInfo {
  @Field(() => ID!)
  id: string;

  @Field(() => Date!)
  @Expose()
  createdAt: Date;
}
