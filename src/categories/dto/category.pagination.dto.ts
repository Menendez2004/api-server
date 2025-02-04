import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/pagination/pagination.meta';

import { CategoryType } from './category.interface.dto';

@ObjectType()
export class CategoryPagination {
  @Field(() => [CategoryType])
  collection: CategoryType[];
  @Field()
  meta: PaginationMeta;
}
