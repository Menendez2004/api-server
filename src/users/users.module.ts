import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../helpers/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { ConfigurationModule } from '../helpers/configuration/configuration.module';
import { ConfigurationService } from '../helpers/configuration/configuration.service';
import { MailModule } from '../helpers/mail/mail.module';
import { MailService } from '../helpers/mail/mail.service';
import { TokenService } from '../token/token.service';

@Module({
  imports: [PrismaModule, TokenModule, ConfigurationModule, MailModule],
  providers: [UsersService, ConfigurationService, MailService, TokenService],
  exports: [UsersService],
})
export class UsersModule {}
