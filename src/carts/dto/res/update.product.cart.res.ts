import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { RecordUpdate } from '../../../common/interfaces/index.interface';

@ObjectType({
  implements: () => [RecordUpdate],
})
export class UpdateProductCartRes implements RecordUpdate {
  @Field(() => Date)
  @Expose()
  updatedAt: Date;
}
