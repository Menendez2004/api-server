import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { ConfigurationModule } from '../common/configuration/configuration.module';
import { PrismaModule } from '../common/prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ConfigurationModule, PrismaModule, OrdersModule],
  providers: [StripeService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
