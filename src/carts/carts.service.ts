import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { Carts, CartItems } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { RemoveProductFromCartArgs, UpsertCartItemInput } from './dto/args/index.arg';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { RemoveProductCartRes, UpdateProductCartRes } from './dto/res/index.res';
import { ValidatorService } from 'src/helpers/service/validator.service';

@Injectable()
export class CartsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly productService: ProductsService,
        private readonly validatorService: ValidatorService
    ) { }

    async addProductToCart(
        userId: string,
        data: UpsertCartItemInput,
    ): Promise<UpdateProductCartRes> {
        const product = await this.validatorService.findProductExitence(data.productId);
        if (data.quantity > product.stock) {
            throw new NotAcceptableException('Insufficient product stock');
        }

        const cart = await this.getOrCreateCart(userId, data.cartId);

        const cartItem = await this.upsertCartItem(
            cart.id,
            data.productId,
            data.quantity,
        );

        return plainToInstance(UpdateProductCartRes, cartItem);
    }

    async deleteProductFromCart(
        userId: string,
        data: RemoveProductFromCartArgs,
    ): Promise<RemoveProductCartRes> {
        await this.validatorService.findProductExitence(data.productId);
        const cart = await this.findCartById(data.cartId);

        this.validateCartOwnership(cart, userId);

        try {
            await this.prismaService.cartItems.delete({
                where: {
                    cartId_productId: {
                        cartId: data.cartId,
                        productId: data.productId,
                    },
                },
            });
        } catch {
            throw new NotFoundException('Product not found in cart');
        }

        return plainToInstance(RemoveProductCartRes, { deletedAt: new Date() });
    }




    private async getOrCreateCart(
        userId: string,
        cartId?: string,
    ): Promise<Carts> {
        if (!cartId) {
            const existingCart = await this.prismaService.carts.findUnique({
                where: { userId },
            });

            if (existingCart) {
                return existingCart;
            }

            return this.prismaService.carts.create({
                data: {
                    user: { connect: { id: userId } },
                },
            });
        }

        const cart = await this.findCartById(cartId);
        this.validateCartOwnership(cart, userId);
        return cart;
    }

    private async upsertCartItem(
        cartId: string,
        productId: string,
        quantity: number,
    ): Promise<CartItems> {
        return this.prismaService.cartItems.upsert({
            where: {
                cartId_productId: { cartId, productId },
            },
            update: { quantity },
            create: {
                cartId,
                productId,
                quantity,
            },
        });
    }

    async findCartById(cartId: string): Promise<Carts> {
        const cart = await this.prismaService.carts.findUnique({
            where: { id: cartId },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }
        return cart;
    }

    validateCartOwnership(cart: Carts, userId: string): void {
        if (cart.userId !== userId) {
            throw new NotAcceptableException('Cart does not belong to the user');
        }
    }

    async clearCartItems(cartId: string) {
        return this.prismaService.cartItems.deleteMany({
            where: { cartId },
        });
    }

    async getCartItems(cartId: string) {
        return this.prismaService.cartItems.findMany({
            where: { cartId },
        });
    }

    



}
