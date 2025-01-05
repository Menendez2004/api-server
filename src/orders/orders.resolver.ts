import {
    Args, Mutation, Context, Query, Resolver
} from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { OrderDetailType, OrderType } from './types/index.types'
import { GetOrderArg, NewOrderArg } from './dto/args/index.arg'
import { NewOrderRecordRes } from './dto/res/index.res'
import { OrdersService } from './orders.service';
import { AuthRole } from 'src/auth/decorators/auth.roles.decorator';

@Resolver(() => OrderDetailType)
@UseFilters(new GlobalExceptionFilter())
export class OrdersResolver {
    constructor(private readonly ordersService: OrdersService) { }

    @AuthRole('CLIENT')
    @Mutation(() => NewOrderRecordRes)
    async createOrder(
        @Args('newOrderData') orderData: NewOrderArg,
        @Context('req') {user}: {user: {id: string}}
    ): Promise<NewOrderRecordRes> {
        return this.ordersService.addOrder( user.id, orderData);
    }

    @AuthRole('CLIENT', 'MANAGER')
    @Query(() => OrderType)
    async getOrderById(
        @Args('orderData') args: GetOrderArg, 
        @Context('req') req: any
    ){
        return this.ordersService.getOrderById(args.orderId, req.user);
    }

}
