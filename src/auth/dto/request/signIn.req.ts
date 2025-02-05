import { IsString, IsEmail } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
