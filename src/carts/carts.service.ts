import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { Carts, CartItems } from '@prisma/client';
import { CartType as CartType } from './types/cart.type';
import { CartItemType as CartItemType } from './types/cart.item.type';
import { plainToInstance } from 'class-transformer';
import { RemoveProductFromCartArgs, UpsertCartItemInput } from './dto/args/index.arg';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { RemoveProductCartRes, UpdateProductCartRes } from './dto/res/index.res';
import { ValidatorService } from 'src/helpers/service/validator.service';

@Injectable()
export class CartsService {
    constructor(
        private readonly prismaService: PrismaService,
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

    async getCartByUserId(userId: string): Promise<CartType> {
        const cart = await this.prismaService.carts.findUnique({
            where: { userId },
            include: this.getCartIncludeRelations(),
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        return plainToInstance(CartType, {
            ...cart,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
            cartItems: cart.CartItems.map((item) => ({
                ...item,
                product: item.product,
            })),
        });
    }



    async getCartItemsByCartId(cartId: string): Promise<CartItemType[]> {
        await this.findCartById(cartId);

        const cartItems = await this.prismaService.cartItems.findMany({
            where: { cartId },
            include: this.getCartItemIncludeRelations(),
        });

        return plainToInstance(
            CartItemType,
            cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                created_at: item.createdAt,
                updated_at: item.updatedAt,
                product: this.transformProduct(item.product),
            })),
        );
    }


    private transformProduct(product: any): any {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            stock: product.stock,
            isAvailable: product.isAvailable,
            price: product.price,
            categories: product.categories.map((relation) => ({
                id: relation.category.id,
                name: relation.category.name,
            })),
            images: product.images.map((image) => ({
                id: image.id,
                imageUrl: image.imageUrl,
                publicId: image.publicId,
            })),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }

    private getCartIncludeRelations() {
        return {
            CartItems: {
                include: {
                    product: {
                        include: {
                            categories: true, 
                            images: true,     
                        },
                    },
                },
            },
        };
    }


    private getCartItemIncludeRelations() {
        return {
            product: {
                include: {
                    categories: {
                        select: {
                            category: { select: { id: true, category_name: true } },
                        },
                    },
                    images: {
                        select: {
                            id: true,
                            imageUrl: true,
                            publicId: true,
                        },
                    },
                },
            },
        };
    }



}
