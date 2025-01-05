import { registerEnumType } from '@nestjs/graphql';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}
export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}


registerEnumType(SortOrder, { name: 'SortOrder' });

registerEnumType(OrderStatus, {
    name: 'OrderStatus',
    description: 'The status of the order',
});