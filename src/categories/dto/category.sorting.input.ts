import { InputType, Field } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { SortOrder } from '../../common/enums/sort.order.enum';

export enum CategorySortableField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

registerEnumType(CategorySortableField, { name: 'CategorySortableField' });

@InputType()
export class SortinCategoryInput {
  @Field(() => CategorySortableField, {
    defaultValue: CategorySortableField.NAME,
  })
  @IsOptional()
  @IsEnum(CategorySortableField)
  field: CategorySortableField;

  @Field(() => SortOrder, { defaultValue: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder;
}
