import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class ImagesTypes {
  @Field(() => ID)
  @Expose()
  id: string;

  @Field({ name: 'productId' })
  productId: string;

  @Field({ name: 'imageUrl' })
  imageUrl: string;

  @Field({ name: 'publicId' })
  publicId: string;

  @Field({ name: 'createdAt' })
  createdAt: Date;

  @Field({ name: 'updatedAt' })
  updatedAt: Date;
}
