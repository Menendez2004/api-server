import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ResetPassReqDto {
  @IsDefined()
  @IsNotEmpty()
  @IsStrongPassword()
  new_password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
