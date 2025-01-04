import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { NewRecordInfo } from '../../../helpers/interfaces/index.interface';

@ObjectType({
  implements: () => [NewRecordInfo],
})
export class AddFavoriteRes implements NewRecordInfo {
  @Field(() => ID!)
  id: string;

  @Field(() => Date!)
  @Expose()
  createdAt: Date;
}
