import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return DATABASE_URL from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('http://localhost');
    expect(service.baseUrl).toBe('http://localhost');
  });

  it('should return nodeEnv from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('development');
    expect(service.nodeEnv).toBe('development');
  });

  it('should return JWT_SECRET from .env  ', () => {
    jest.spyOn(configService, 'get').mockReturnValue('secret');
    expect(service.jwtSecret).toBe('secret');
  });

  it('should return JWT_EXPIRATION from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('3600s');
    expect(service.jwtExpiration).toBe('3600s');
  });

  it('should return CLOUDINARY_NAME from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('cloudName');
    expect(service.cloudinaryCloudName).toBe('cloudName');
  });

  it('should return CLOUDINARY_API_KEY from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('apiKey');
    expect(service.cloudinaryApiKey).toBe('apiKey');
  });

  it('should return CLOUDINARY_API_SECRET from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('apiSecret');
    expect(service.cloudinaryApiSecret).toBe('apiSecret');
  });

  it('should return STRIPE_SECRET_KEY from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('stripeSecret');
    expect(service.stripeSecretKey).toBe('stripeSecret');
  });

  it('should return STRIPE_WEBHOOK_SIGNING_SECRET from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('webhookSecret');
    expect(service.stripeWebhookSigningSecret).toBe('webhookSecret');
  });

  it('should return EMAIL_HOST from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('smtp.mailtrap.io');
    expect(service.emailHost).toBe('smtp.mailtrap.io');
  });

  it('should return EMAIL_PORT from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('2525');
    expect(service.emailPort).toBe('2525');
  });

  it('should return EMAIL_USER from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('user');
    expect(service.emailUser).toBe('user');
  });

  it('should return EMAIL_PASS from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('pass');
    expect(service.emailPass).toBe('pass');
  });

  it('should return EMAIL_FROM from .env', () => {
    jest.spyOn(configService, 'get').mockReturnValue('from@example.com');
    expect(service.emailFrom).toBe('from@example.com');
  });
});
