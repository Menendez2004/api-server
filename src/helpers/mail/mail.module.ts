import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigurationModule } from '../../helpers/configuration/configuration.module';
import { ConfigurationService } from '../../helpers/configuration/configuration.service';

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
        template: {
          dir: process.cwd() + '/public/template/mails',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
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
