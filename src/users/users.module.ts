import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { ConfigurationModule } from '../common/configuration/configuration.module';
import { ConfigurationService } from '../common/configuration/configuration.service';
import { MailModule } from '../common/mail/mail.module';
import { MailService } from '../common/mail/mail.service';
import { TokenService } from '../token/token.service';

@Module({
  imports: [PrismaModule, TokenModule, ConfigurationModule, MailModule],
  providers: [UsersService, ConfigurationService, MailService, TokenService],
  exports: [UsersService],
})
export class UsersModule {}
