import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../helpers/prisma/prisma.service';
import {  NewOrderRecord } from './dto/res/index.res';
import { CartsService } from '../carts/carts.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { plainToInstance } from 'class-transformer';
import {  NewOrderArg } from './dto/args/index.arg';
import { OrderType } from './types/index.types';
import { RoleName } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cartService: CartsService,
        private readonly usersService: UsersService,
        private readonly productsService: ProductsService,
    ) { }

    async addOrder(userId: string, args: NewOrderArg): Promise<NewOrderRecord> {
        const cart = await this.validateCartOwnership(userId, args.cartId);
        const cartItems = await this.validateCartItems(args.cartId);

        const order = await this.createOrder(args, cart.userId);
        await this.createOrderDetails(order.id, cartItems);
        await this.cartService.clearCartItems(args.cartId);

        return plainToInstance(NewOrderRecord, order);
    }

    async getOrderById(
        orderId: string,
        user: { id: string; role: RoleName },
    ): Promise<OrderType> {
        const order = await this.fetchOrderWithDetails(orderId);
        if (user.role === RoleName.CLIENT) {
            if (order.userId !== user.id) {
                throw new NotAcceptableException('Unauthorized to access this order');
            }
        }
        return plainToInstance(OrderType, order);
    }

    private async validateCartOwnership(userId: string, cartId: string) {
        const cart = await this.cartService.findCartById(cartId);
        if (cart.userId !== userId) {
            throw new NotAcceptableException('Unauthorized to access this cart');
        }
        return cart;
    }

    private async validateCartItems(cartId: string) {
        const cartItems = await this.cartService.getCartItems(cartId);
        if (cartItems.length === 0) {
            throw new NotAcceptableException('Cart has no items');
        }
        return cartItems;
    }

    private async createOrder(args: NewOrderArg, userId: string) { // Changed type to AddOrderArg
        const user = await this.usersService.findById(userId);

        return this.prismaService.orders.create({
            data: {
                address: args.address || user.address, // Use address from args if provided
                userId: user.id,
            },
        });
    }

    private async createOrderDetails(orderId: string, cartItems: any[]) {
        const orderDetails = cartItems.map(async (item) => ({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: await this.productsService.getproductPrice(item.productId),
        }));

        return this.prismaService.orderDetails.createMany({
            data: await Promise.all(orderDetails),
        });
    }

    private async fetchOrderWithDetails(orderId: string) {
        const order = await this.prismaService.orders.findUnique({
            where: { id: orderId },
            include: {
                user: { include: { role: true } },
                OrderDetails: {
                    include: {
                        product: {
                            include: {
                                Categories: true,
                                images: true,
                            },
                        },
                    },
                },
                paymentDetail: {
                    include: {
                        status: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        return order;
    }
}
