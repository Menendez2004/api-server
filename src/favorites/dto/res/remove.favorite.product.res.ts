import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { RecordDeletion } from '../../../common/interfaces/index.interface';

@ObjectType({
  implements: () => [RecordDeletion],
})
export class RemoveFavoriteRes implements RecordDeletion {
  @Field(() => Date!)
  @Expose()
  deletedAt: Date;
}
