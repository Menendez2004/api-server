import { Injectable, NotAcceptableException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { OrdersService } from 'src/orders/orders.service';
import { AddPaymentRes, WebhookReq } from './dto/index.dto';
import { RoleName } from '@prisma/client';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        private readonly configurationService: ConfigurationService,    
        private readonly prisma: PrismaService,
        private readonly orderService: OrdersService,
    ) {
        this.stripe = new Stripe(this.configurationService.stripeSecretKey), {
            apiVersion: '2024-11-20.acacia',
        };
    }

    async createPaymentIntent(
        orderId: string,
        user: { id: string; role: RoleName },
    ): Promise<AddPaymentRes> {
        const orderAlreadyPaid = await this.prisma.paymentDetails.findFirst({
            where: { orderId},
        });

        if (orderAlreadyPaid) {
            throw new NotAcceptableException(' looks like this order has already been paid');
        }
        const order = await this.orderService.getOrderById(orderId, user);
        const amount = order.orderDetails.reduce((amount, orderDetail) => {
            amount += orderDetail.quantity * orderDetail.unit_price;
            return amount;
        }, 0);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { orderId },
        });

        await this.prisma.paymentDetails.create({
            data: {
                paymentIntentId: paymentIntent.id,
                paymentMethodId: paymentIntent.payment_method_types.join(','),
                order: { connect: { id: orderId } },
                amount,
                status: { connect: { id: 1 } },
                paymentDate: new Date(),
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
        };
    }

    async handleStripeWebhook(data: WebhookReq) {
        const { id, status, amount, payment_method, order_id } = data;

        const statusPayment = status === 'succeeded' ? 2 : 3;
        return this.prisma.paymentDetails.update({
            where: {
                orderId: order_id || undefined,
                paymentIntentId: id,
            },
            data: {
                paymentMethodId: payment_method ?? 'not provided',
                amount: parseInt(amount),
                statusId: statusPayment,
                updatedAt: new Date(),
                paymentDate: new Date(),
            },
        });
    }
}
