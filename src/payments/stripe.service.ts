import { Injectable, NotAcceptableException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { OrdersService, } from 'src/orders/orders.service';
import { AddPaymentRes, WebhookReq } from './dto/index.dto';
import { RoleName } from '@prisma/client';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        private readonly configurationService: ConfigurationService,
        private readonly prismaService: PrismaService,
        private readonly orderService: OrdersService,
    ) {
        this.stripe = new Stripe(this.configurationService.stripeSecretKey, {
            apiVersion: '2024-12-18.acacia',
        });
    }

    async createPaymentIntent(
        orderId: string,
        user: { id: string; role: RoleName },
    ): Promise<AddPaymentRes> {
        const existingPayment = await this.prismaService.paymentDetails.findFirst({
            where: { orderId },
        });

        if (existingPayment) {
            throw new NotAcceptableException(' This order has already been paid');
        }
        const order = await this.orderService.getOrderById(orderId, user);
        const totalAmount = order.orderDetails.reduce((sum, orderDetail) => {
            return sum + orderDetail.quantity * orderDetail.price;
        }, 0);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            metadata: { orderId },
        });
        await this.recordPaymentDetails(orderId, paymentIntent, totalAmount);

        return { clientSecret: paymentIntent.client_secret };
    }


    private async recordPaymentDetails(
        orderId: string,
        paymentIntent: Stripe.PaymentIntent,
        amount: number,
    ): Promise<void> {
        await this.prismaService.paymentDetails.create({
            data: {
                paymentIntentId: paymentIntent.id,
                paymentMethodId: paymentIntent.payment_method_types.join(','),
                order: { connect: { id: orderId } },
                amount,
                status: { connect: { id: 1 } },
                paymentDate: new Date(),
            },
        });
    }


    async handleStripeWebhook(payload: Buffer, headers: any): Promise<void> {
        const stripeSignature = headers['stripe-signature'];
    
        let event: Stripe.Event;
    
        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                stripeSignature,
                this.configurationService.stripeWebhookSigningSecret, 
            );
        } catch (err) {
            console.error('Stripe webhook signature verification failed:', err.message);
            throw new NotAcceptableException('Invalid Stripe webhook signature.');
        }

        const eventData = event.data.object as Stripe.PaymentIntent;
        
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.processSuccessfulPayment(eventData);
                break;
            case 'payment_intent.payment_failed':
                await this.processFailedPayment(eventData);
                break;
    
            default:
                console.warn(`Unhandled event type: ${event.type}`);
        }
    }
    
    private async processSuccessfulPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = paymentIntent.metadata?.orderId;
    
        if (!orderId) {
            console.error('Payment Intent missing orderId metadata.');
            return;
        }
    
        await this.prismaService.paymentDetails.update({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                statusId: 2,
                paymentMethodId: typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : 'not provided',
                amount: paymentIntent.amount,
                updatedAt: new Date(),
                paymentDate: new Date(),
            },
        });
    
        console.log(`Order ${orderId} payment succeeded.`);
    }
    
    private async processFailedPayment(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = paymentIntent.metadata?.orderId;
    
        if (!orderId) {
            console.error('Payment Intent missing orderId metadata.');
            return;
        }
    
        await this.prismaService.paymentDetails.update({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                statusId: 3, // Assuming 3 corresponds to 'failed'
                updatedAt: new Date(),
            },
        });
    
        console.log(`Order ${orderId} payment failed.`);
    }
}
