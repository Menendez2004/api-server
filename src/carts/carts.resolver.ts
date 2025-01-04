import {
    Args,
    Context,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
} from '@nestjs/graphql';
import { CartsService } from './carts.service';
import { Auth } from 'src/auth/decorators/auth.roles.decorator';
import { UseFilters } from '@nestjs/common';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { UpsertCartItemInput } from './dto/args/index.arg';
import { RemoveProductCartRes,UpdateProductCartRes } from './dto/res/index.res';
import { RemoveProductFromCartArgs } from './dto/args/remove.product.from.cart.args';
import { CartType } from './types/cart.type';
import { CartItemType } from './types/cart.item.type';

@Resolver(() => CartType)
@UseFilters(new GlobalExceptionFilter())
export class CartsResolver {
    constructor(private readonly cartsService: CartsService) { }

    @Auth('CLIENT')
    @Mutation(() => UpdateProductCartRes)
    async addOrUpdateCartProduct(
        @Args('data') data: UpsertCartItemInput,
        @Context('request') req: any,
    ): Promise<UpdateProductCartRes> {
        const userId = req.user.id;
        return this.cartsService.addProductToCart(userId, data);
    }

    @Auth('CLIENT')
    @Mutation(() => RemoveProductCartRes)
    async removeProductFromCart(
        @Args('data') data: RemoveProductFromCartArgs,
        @Context('request') req: any,
    ): Promise<RemoveProductCartRes> {
        const userId = req.user.id;
        return this.cartsService.deleteProductFromCart(userId, data);
    }

    @Auth('CLIENT')
    @Query(() => CartType)
    async getCarts(@Context('request') req: any): Promise<CartType> {
        const userId = req.user.id;
        return this.cartsService.getCartByUserId(userId);
    }

    @ResolveField(() => [CartItemType])
    async cartItems(@Parent() cart: CartType): Promise<CartItemType[]> {
        return this.cartsService.getCartItemsByCartId(cart.id);
    }
}
