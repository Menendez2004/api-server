import {Field, ID, ObjectType} from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

@ObjectType()
export class CreateProductsRes {

    @Field(() => ID!)
    @IsUUID()
    id: string;

    @Field( () => String, {name: 'name'})
    @Expose( {name: 'name'})
    name: string;

    @Field( () => String, {name: 'CreatedAt'})
    @Expose({name: 'CreatedAt'})
    createdAt: Date;

}