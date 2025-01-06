import {Field, ObjectType,} from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class DeletedProductsRes {

    @Field( () => String, {name: 'deletedAt'})
    @Expose({name: 'deletedAt'})
    deletedAt: Date;

}