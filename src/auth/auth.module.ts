import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalPassportStrategy } from './strategies/local.passport.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from 'src/helpers/configuration/configuration.module';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (configService: ConfigurationService) => {
        return {
          secret: configService.jwtSecret,
          signOptions: { expiresIn: configService.jwtExpiration },
        };
      },
      inject: [ConfigurationService],
    }),
  ],

  providers: [
    AuthService,
    LocalPassportStrategy,
    JwtStrategy,
    ConfigurationService,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
