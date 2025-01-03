import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class ImagesTypes {
    @Field(() => ID)
    @Expose()
    id: string;

    @Field({ name: 'productId' })
    @Expose({ name: 'productId' })
    @Expose()
    productId: string;

    @Field({ name: 'imageUrl' })
    @Expose({ name: 'imageUrl' })
    @Expose()
    imageUrl: string;

    @Field({ name: 'createdAt' })
    @Expose({ name: 'createdAt' })
    @Expose()
    createdAt: Date;

    @Field({ name: 'updatedAt' })
    @Expose({ name: 'updatedAt' })
    @Expose()
    updatedAt: Date;
}
