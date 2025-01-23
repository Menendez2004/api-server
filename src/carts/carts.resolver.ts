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
import { AuthRole } from 'src/auth/decorators/auth.roles.decorator';
import { UseFilters } from '@nestjs/common';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { UpsertCartItemInput } from './dto/args/index.args';
import {
  RemoveProductCartRes,
  UpdateProductCartRes,
} from './dto/res/index.res';
import { RemoveProductFromCartArgs } from './dto/args/remove.product.from.cart.args';
import { CartType } from './types/cart.type';
import { CartItemType } from './types/cart.item.types';

@Resolver(() => CartType)
@UseFilters(new GlobalExceptionFilter())
export class CartsResolver {
  constructor(private readonly cartsService: CartsService) {}

  @AuthRole('CLIENT')
  @Mutation(() => UpdateProductCartRes)
  async upsertCartProduct(
    @Args('data') data: UpsertCartItemInput,
    @Context('request') req: any,
  ): Promise<UpdateProductCartRes> {
    const userId = req.user.id;
    return this.cartsService.upsertCartProduct(userId, data);
  }

  @AuthRole('CLIENT')
  @Mutation(() => RemoveProductCartRes)
  async removeProductFromCart(
    @Args('data') data: RemoveProductFromCartArgs,
    @Context('request') req: any,
  ): Promise<RemoveProductCartRes> {
    const userId = req.user.id;
    return this.cartsService.removeProductFromCart(userId, data);
  }

  @AuthRole('CLIENT')
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
