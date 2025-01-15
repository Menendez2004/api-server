import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigurationModule } from 'src/helpers/configuration/configuration.module';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: async (configService: ConfigurationService) => ({
        transport: {
          host: configService.emailHost,
          port: parseInt(configService.emailPort, 10),
          secure: configService.emailPort === '465',
          auth: {
            user: configService.emailUser,
            pass: configService.emailPass,
          },
        },
        defaults: {
          from: configService.emailFrom,
        },
      }),
      inject: [ConfigurationService],
    }),
    ConfigurationModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
