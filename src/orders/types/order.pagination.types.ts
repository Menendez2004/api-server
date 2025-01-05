import { ObjectType, Field } from '@nestjs/graphql';
import { OrderType } from './index.types';  // Replace with your actual Order entity
import { PaginationMeta } from '../../helpers/pagination/index.pagination';

@ObjectType()
export class OrderPagination {
    @Field(() => [OrderType])
    items: OrderType[];

    @Field(() => PaginationMeta)
    meta: PaginationMeta;
}