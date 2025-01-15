import { Expose } from 'class-transformer';

export class SignUpResDto {
  @Expose({ name: 'email' })
  mail: string;

  @Expose({ name: 'username' })
  username: string;
}
