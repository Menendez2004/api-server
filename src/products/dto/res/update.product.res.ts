import { Field, ObjectType } from '@nestjs/graphql';
import { RecordUpdate } from '../../../helpers/interfaces/index.interface';

@ObjectType({
  implements: () => RecordUpdate,
})
export class UpdateProductRes implements RecordUpdate {
  @Field(() => Date!)
  updatedAt: Date;
}
