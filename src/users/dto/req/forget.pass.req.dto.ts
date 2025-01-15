import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgetPassReqDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
