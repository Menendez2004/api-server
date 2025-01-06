import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/helpers/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';
import { ConfigurationModule } from 'src/helpers/configuration/configuration.module';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';
import { MailModule } from 'src/helpers/mail/mail.module';
import { MailService } from 'src/helpers/mail/mail.service';

@Module({
  imports: [
    PrismaModule,
    TokenModule,
    ConfigurationModule,
    MailModule
  ],
  providers: [UsersService, ConfigurationService, MailService],
  exports: [UsersService]
})
export class UsersModule { }
