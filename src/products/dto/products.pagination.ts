import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from 'src/helpers/pagination/pagination.meta';

import { ProductType } from './products.intefaces.dto';

@ObjectType()
export class ProductsPagination {
    @Field(()=> [ProductType]) 
    collection: ProductType[];
    @Field()
    meta: PaginationMeta;
}
