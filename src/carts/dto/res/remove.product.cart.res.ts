import { Field, ObjectType } from '@nestjs/graphql';
import { RecordDeletion } from '../../../helpers/interfaces/index.interface';

@ObjectType({
  implements: () => [RecordDeletion],
})
export class RemoveProductCartRes implements RecordDeletion {
  @Field(() => Date)
  deletedAt: Date;
}
