import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { EmailTemplateDto } from './dto/template.email.dto';

jest.mock('@nestjs-modules/mailer');

describe('MailService', () => {
  let mailService: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should call sendMail with correct parameters for a valid emailTemplate', async () => {
    const emailTemplate: EmailTemplateDto = {
      email: 'test@example.com',
      subject: 'Test Subject',
      template: 'test-template',
      userName: 'John Doe',
      message: 'Test message',
      uri: 'http://example.com',
    };

    await mailService.sendMail(emailTemplate);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: emailTemplate.email,
      subject: emailTemplate.subject,
      template: emailTemplate.template,
      context: {
        message: emailTemplate.message,
        name: emailTemplate.userName,
        uri: emailTemplate.uri,
      },
    });
  });

  it('should handle missing optional fields by using empty strings', async () => {
    const emailTemplate: EmailTemplateDto = {
      email: 'test@example.com',
      subject: 'Test Subject',
      template: 'test-template',
      userName: 'John Doe',
      uri: 'http://example.com',
    };

    await mailService.sendMail(emailTemplate);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: emailTemplate.email,
      subject: emailTemplate.subject,
      template: emailTemplate.template,
      context: {
        name: emailTemplate.userName,
        uri: emailTemplate.uri,
      },
    });
  });

  it('should throw an error if MailerService.sendMail throws an error', async () => {
    const emailTemplate: EmailTemplateDto = {
      email: 'test@example.com',
      subject: 'Test Subject',
      template: 'test-template',
      userName: 'John Doe',
      uri: 'http://example.com',
    };

    jest
      .spyOn(mailerService, 'sendMail')
      .mockRejectedValueOnce(new Error('Mail error'));

    await expect(mailService.sendMail(emailTemplate)).rejects.toThrow(
      'Mail error',
    );
  });

  it('should work with required fields', async () => {
    const emailTemplate: EmailTemplateDto = {
      email: 'test@example.com',
      subject: 'Minimal Subject',
      template: 'minimal-template',
      userName: 'Minimal User',
      uri: 'http://minimal.example.com',
    };

    await mailService.sendMail(emailTemplate);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: emailTemplate.email,
      subject: emailTemplate.subject,
      template: emailTemplate.template,
      context: {
        name: emailTemplate.userName,
        uri: emailTemplate.uri,
      },
    });
  });
});
