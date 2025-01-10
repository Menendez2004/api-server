import { IsString } from 'class-validator';

export class WebhookReq {
  @IsString()
  id: string;

  @IsString()
  status: string;

  @IsString()
  amount: string;

  @IsString()
  payment_method: string;

  @IsString()
  order_id: string;
}
