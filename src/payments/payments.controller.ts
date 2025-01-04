import { Controller, Post, Body, UseFilters, Request } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';
import { Auth } from 'src/auth/decorators/auth.roles.decorator';
import { plainToInstance } from 'class-transformer';
import { WebhookReq, AddPaymentReq } from './dto/index.dto';

@UseFilters(GlobalExceptionFilter)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentService: StripeService) { }

    @Auth('CLIENT')
    @Post()
    async createPayment(
        @Body() req: AddPaymentReq,
        @Request() { user }: any,
    ): Promise<void> {
        await this.paymentService.createPaymentIntent(req.orderId, user);
    }

    @Post('webhook')
    async stripeWebhook(@Body() body: any) {
        const paymentData = {
            id: body.data.object.id,
            status: body.data.object.status,
            amount: body.data.object.amount,
            paymentMethod: body.data.object.paymentMethod,
            orderId: body.data.object.metadata?.orderId,
        };
        const dataFormatted = plainToInstance(WebhookReq, paymentData);
        return this.paymentService.handleStripeWebhook(dataFormatted);
    }
}
