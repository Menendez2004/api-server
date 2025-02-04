import { Field, ObjectType } from '@nestjs/graphql';
import { RecordDeletion } from '../../../common/interfaces/index.interface';

@ObjectType({
  implements: () => [RecordDeletion],
})
export class RemoveProductCartRes implements RecordDeletion {
  @Field(() => Date)
  deletedAt: Date;
}
