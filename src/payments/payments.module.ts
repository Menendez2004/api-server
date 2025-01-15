import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { ConfigurationModule } from 'src/helpers/configuration/configuration.module';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [ConfigurationModule, PrismaModule, OrdersModule],
  providers: [StripeService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
