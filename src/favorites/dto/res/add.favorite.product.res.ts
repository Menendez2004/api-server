import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NewRecordInfo } from '../../../helpers/interfaces/index.interface';

@ObjectType({
  implements: () => [NewRecordInfo],
})
export class AddFavoriteRes implements NewRecordInfo {
  @Field(() => ID!)
  id: string;

  @Field(() => Date!)
  createdAt: Date;
}
