import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddPaymentReq {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  orderId: string;
}
