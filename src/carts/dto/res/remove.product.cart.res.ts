import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { RecordDeletion } from '../../../helpers/interfaces/index.interface';

@ObjectType({
  implements: () => [RecordDeletion],
})
export class RemoveProductCartRes implements RecordDeletion {
  @Field(() => Date, { name: 'deleted_at' })
  @Expose({ name: 'deleted_at' })
  deletedAt: Date;
}
