import { Field, ObjectType } from '@nestjs/graphql';
import { RecordUpdate, } from '../../../helpers/interfaces/index.interface';
import { Expose } from 'class-transformer';

@ObjectType({
  implements: () => RecordUpdate,
})
export class UpdateProductRes implements RecordUpdate {
  @Field(() => Date!, { name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;
}
