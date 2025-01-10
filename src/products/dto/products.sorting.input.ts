import { InputType, Field } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { SortOrder } from '../../helpers/enums/sort.order.enum';

export enum ProductSortableField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  LIKES_COUNT = 'likesCount',
  PRICE = 'price',
}

registerEnumType(ProductSortableField, { name: 'ProductSortableField' });

@InputType()
export class SortingProductInput {
  @Field(() => ProductSortableField, {
    defaultValue: ProductSortableField.NAME,
  })
  @IsOptional()
  @IsEnum(ProductSortableField)
  field: ProductSortableField;

  @Field(() => SortOrder, { defaultValue: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder;
}
