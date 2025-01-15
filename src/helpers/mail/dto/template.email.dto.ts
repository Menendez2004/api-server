import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailTemplateDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  template?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  uri?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;
}
