import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { OperationType } from 'src/helpers/enums/operation.type.enum';

export class UpdateProductImagesArgs {
  @IsEnum(OperationType)
  operation: OperationType;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Expose({ name: 'publicId' })
  publicImageId?: string[];
}
