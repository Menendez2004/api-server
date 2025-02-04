import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private config: ConfigService) {}

  get baseUrl(): string {
    return this.config.get('BASE_URL');
  }

  get nodeEnv(): string {
    return this.config.get('NODE_ENV');
  }

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET');
  }

  get jwtExpiration(): string {
    return this.config.get<string>('JWT_EXPIRATION');
  }
  get cloudinaryCloudName(): string {
    return this.config.get<string>('CLOUDINARY_NAME');
  }

  get cloudinaryApiKey(): string {
    return this.config.get<string>('CLOUDINARY_API_KEY');
  }

  get cloudinaryApiSecret(): string {
    return this.config.get<string>('CLOUDINARY_API_SECRET');
  }

  get stripeSecretKey(): string {
    return this.config.get<string>('STRIPE_SECRET_KEY');
  }

  get stripeWebhookSigningSecret(): string {
    return this.config.get<string>('STRIPE_WEBHOOK_SIGNING_SECRET');
  }

  get emailHost(): string {
    return this.config.get<string>('EMAIL_HOST');
  }

  get emailPort(): string {
    return this.config.get<string>('EMAIL_PORT');
  }

  get emailUser(): string {
    return this.config.get<string>('EMAIL_USER');
  }

  get emailPass(): string {
    return this.config.get<string>('EMAIL_PASSWORD');
  }

  get emailFrom(): string {
    return this.config.get<string>('EMAIL_FROM');
  }
}
