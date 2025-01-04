import { Controller, Post, Body,Headers, UseFilters, Request, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { Auth } from 'src/auth/decorators/auth.roles.decorator';
import { plainToInstance } from 'class-transformer';
import { WebhookReq, AddPaymentReq } from './dto/index.dto';

@UseFilters(GlobalExceptionFilter)
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly paymentService: StripeService) { }

    @Auth('CLIENT')
    @Post()
    async createPayment(
        @Body() req: AddPaymentReq,
        @Request() { user }: any,
    ): Promise<void> {
        await this.paymentService.createPaymentIntent(req.orderId, user);
    }

    @Post('webhook')
    async stripeWebhook(@Req() req: any, @Headers() headers: any): Promise<void> {
        const stripeSignature = headers['stripe-signature'];
        const rawBody = req.rawBody; 

        try {

            await this.stripeService.handleStripeWebhook(rawBody, stripeSignature);
        } catch (err) {
            console.error('Stripe webhook handling failed:', err.message);
            throw err; 
        }
    }
}
