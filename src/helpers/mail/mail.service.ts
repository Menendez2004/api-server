import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailTemplateDto } from './dto/template.email.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendMail(emailTemplate: EmailTemplateDto) {
    await this.mailer.sendMail({
      to: emailTemplate.email,
      subject: emailTemplate.subject,
      template: emailTemplate.template,
      context: {
        message: emailTemplate.message,
        uri: emailTemplate.uri,
        name: emailTemplate.userName,
      },
    });
  }
}
